"""
Chaski Alert — Router de Membresía.
Endpoints administrativos para gestionar solicitudes de adhesión (CU-01/CU-07).
Solo accesibles por la Directiva.
"""

from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from core.security import require_role, get_keycloak_admin
from models.schemas import UsuarioPendiente, MembresiaAction
from database.connection import database
import uuid

router = APIRouter(
    prefix="/api/membresia",
    tags=["Membresía"],
    # Protegido a nivel de router entero, solo la Directiva puede gestionar membresías
    dependencies=[Depends(require_role("Directiva"))]
)

@router.get("/pendientes", response_model=List[UsuarioPendiente])
async def obtener_pendientes():
    """Obtiene la lista de usuarios deshabilitados (pendientes de aprobación)."""
    admin = get_keycloak_admin()
    try:
        # Keycloak API no permite filtrar explícitamente por 'enabled' en todas las versiones, 
        # pero podemos usar el atributo search para traernos todos y filtrar localmente, 
        # o usar q="enabled:false" en la API moderna. Intentemos obtener todos y filtrar:
        users = admin.get_users()
        pendientes = []
        for u in users:
            if not u.get("enabled", True):
                # Extraer atributos (Keycloak los guarda como listas)
                attributes = u.get("attributes", {})
                cedula = attributes.get("cedula", [""])[0] if "cedula" in attributes else ""
                telefono = attributes.get("telefono", [""])[0] if "telefono" in attributes else ""
                sector = attributes.get("sector", [""])[0] if "sector" in attributes else ""
                
                # Timestamp to datetime
                created_ts = u.get("createdTimestamp", 0)
                fecha_registro = datetime.fromtimestamp(created_ts / 1000.0) if created_ts else None
                
                pendientes.append(
                    UsuarioPendiente(
                        keycloak_id=u["id"],
                        email=u.get("email", ""),
                        nombres=f"{u.get('firstName', '')} {u.get('lastName', '')}".strip(),
                        cedula=cedula,
                        telefono=telefono,
                        sector=sector,
                        estado_membresia="PENDIENTE",
                        fecha_registro=fecha_registro
                    )
                )
        return pendientes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo usuarios pendientes: {str(e)}")

@router.get("/aprobados", response_model=List[UsuarioPendiente])
async def obtener_aprobados():
    """Obtiene la lista de usuarios habilitados (Comuneros) combinando Keycloak y la BD local."""
    admin = get_keycloak_admin()
    try:
        # 1. Obtener todos los usuarios de Keycloak
        users = admin.get_users()
        aprobados_kc = []
        for u in users:
            if u.get("enabled", False):
                roles = admin.get_realm_roles_of_user(u["id"])
                if any(r["name"] == "Comunero" for r in roles):
                    aprobados_kc.append(u)
                    
        if not aprobados_kc:
            return []
            
        # 2. Consultar datos extra en PostgreSQL
        keycloak_ids = [u["id"] for u in aprobados_kc]
        
        # PostgreSQL IN clause with bind variables
        placeholders = ", ".join([f":id_{i}" for i in range(len(keycloak_ids))])
        values = {f"id_{i}": keycloak_ids[i] for i in range(len(keycloak_ids))}
        
        query = f"""
            SELECT u.keycloak_id, u.cedula, u.telefono, s.nombre as sector, u.estado_membresia, u.fecha_registro
            FROM usuarios u
            LEFT JOIN sectores s ON u.id_sector = s.id
            WHERE u.keycloak_id IN ({placeholders})
        """
        rows = await database.fetch_all(query=query, values=values)
        
        # Mapear los resultados de la BD por keycloak_id
        db_data = {row["keycloak_id"]: dict(row) for row in rows}
        
        aprobados = []
        for u in aprobados_kc:
            kc_id = u["id"]
            db_user = db_data.get(kc_id, {})
            
            # Preferir atributos de Keycloak si existen (como fallback), sino usar la BD
            attributes = u.get("attributes", {})
            cedula = db_user.get("cedula") or (attributes.get("cedula", [""])[0] if "cedula" in attributes else "")
            telefono = db_user.get("telefono") or (attributes.get("telefono", [""])[0] if "telefono" in attributes else "")
            sector = db_user.get("sector") or (attributes.get("sector", [""])[0] if "sector" in attributes else "")
            
            created_ts = u.get("createdTimestamp", 0)
            fecha_registro = db_user.get("fecha_registro") or (datetime.fromtimestamp(created_ts / 1000.0) if created_ts else None)
            
            aprobados.append(
                UsuarioPendiente(
                    keycloak_id=kc_id,
                    email=u.get("email", ""),
                    nombres=f"{u.get('firstName', '')} {u.get('lastName', '')}".strip() or u.get("username", ""),
                    cedula=cedula,
                    telefono=telefono,
                    sector=sector,
                    estado_membresia=db_user.get("estado_membresia") or "APROBADO",
                    fecha_registro=fecha_registro
                )
            )
        return aprobados
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo usuarios aprobados: {str(e)}")

@router.post("/{user_id}/aprobar")
async def aprobar_usuario(user_id: str, payload: MembresiaAction):
    """Aprueba la solicitud de un usuario, habilitándolo, actualizando sus atributos y asignando el rol Comunero."""
    if payload.accion != "APROBAR":
        raise HTTPException(status_code=400, detail="Acción no válida")
        
    admin = get_keycloak_admin()
    try:
        # Obtener usuario para no perder firstName, lastName y email
        user_info = admin.get_user(user_id)
        
        # Preparar atributos a actualizar
        attributes = user_info.get("attributes", {})
        if payload.cedula: attributes["cedula"] = [payload.cedula]
        if payload.telefono: attributes["telefono"] = [payload.telefono]
        if payload.nombre_sector: attributes["sector"] = [payload.nombre_sector]
        
        user_info["enabled"] = True
        user_info["attributes"] = attributes
        
        # Actualizar en Keycloak
        admin.update_user(user_id=user_id, payload=user_info)
        
        # Asignar rol 'Comunero'
        realm_role = admin.get_realm_role("Comunero")
        admin.assign_realm_roles(user_id=user_id, roles=[realm_role])
        
        # Actualizar o insertar en la base de datos local
        nombres = f"{user_info.get('firstName', '')} {user_info.get('lastName', '')}".strip()
        email = user_info.get("email", "")
        
        # Hacemos UPSERT basado en la cédula (única) o en keycloak_id (único).
        # Primero intentamos con keycloak_id. Si el usuario no existe en la tabla, lo insertamos.
        query_check = "SELECT id FROM usuarios WHERE keycloak_id = :keycloak_id"
        row = await database.fetch_one(query=query_check, values={"keycloak_id": user_id})
        
        if row:
            query = """
                UPDATE usuarios 
                SET estado_membresia = 'APROBADO',
                    cedula = :cedula,
                    telefono = :telefono,
                    id_sector = :id_sector
                WHERE keycloak_id = :keycloak_id
            """
            await database.execute(query=query, values={
                "keycloak_id": user_id,
                "cedula": payload.cedula or "SIN_CEDULA",
                "telefono": payload.telefono,
                "id_sector": payload.id_sector
            })
        else:
            query = """
                INSERT INTO usuarios (keycloak_id, cedula, nombres, telefono, email, id_rol, id_sector, estado_membresia)
                VALUES (:keycloak_id, :cedula, :nombres, :telefono, :email, 2, :id_sector, 'APROBADO')
            """
            await database.execute(query=query, values={
                "keycloak_id": user_id,
                "cedula": payload.cedula or str(uuid.uuid4())[:15],
                "nombres": nombres,
                "telefono": payload.telefono,
                "email": email,
                "id_sector": payload.id_sector
            })
        
        return {"mensaje": "Usuario aprobado, atributos actualizados y habilitado con éxito / Allinlla."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al aprobar usuario: {str(e)}")

@router.post("/{user_id}/rechazar")
async def rechazar_usuario(user_id: str, payload: MembresiaAction):
    """Rechaza la solicitud de un usuario eliminándolo de Keycloak."""
    if payload.accion != "RECHAZAR":
        raise HTTPException(status_code=400, detail="Acción no válida")
        
    admin = get_keycloak_admin()
    try:
        admin.delete_user(user_id=user_id)
        
        # Eliminar de la base de datos local
        query = "DELETE FROM usuarios WHERE keycloak_id = :keycloak_id"
        await database.execute(query=query, values={"keycloak_id": user_id})
        
        return {"mensaje": "Usuario rechazado y eliminado / Mana chaski."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al rechazar usuario: {str(e)}")
