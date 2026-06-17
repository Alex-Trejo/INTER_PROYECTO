from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database.connection import database
from core.security import get_current_user, get_keycloak_admin

router = APIRouter(prefix="/api/perfil", tags=["Perfil de Usuario"])

class PerfilUpdate(BaseModel):
    telefono: Optional[str] = None
    id_sector: Optional[int] = None

@router.get("/mi-perfil", summary="Obtener mis datos de perfil")
async def obtener_mi_perfil(current_user: dict = Depends(get_current_user)):
    keycloak_id = current_user.get("sub")
    
    # 1. Obtener de Base de Datos
    query = """
        SELECT u.cedula, u.telefono, s.nombre as sector, s.id as id_sector
        FROM usuarios u
        LEFT JOIN sectores s ON u.id_sector = s.id
        WHERE u.keycloak_id = :keycloak_id
    """
    row = await database.fetch_one(query=query, values={"keycloak_id": keycloak_id})
    db_data = dict(row) if row else {}

    # 2. Obtener de Keycloak como fuente secundaria (si BD está vacía)
    try:
        admin = get_keycloak_admin()
        user_info = admin.get_user(keycloak_id)
        attributes = user_info.get("attributes", {})
        
        return {
            "cedula": db_data.get("cedula") or (attributes.get("cedula", [""])[0] if "cedula" in attributes else ""),
            "telefono": db_data.get("telefono") or (attributes.get("telefono", [""])[0] if "telefono" in attributes else ""),
            "sector": db_data.get("sector") or (attributes.get("sector", [""])[0] if "sector" in attributes else ""),
            "id_sector": db_data.get("id_sector"),
        }
    except Exception as e:
        print(f"Error Keycloak GET perfil: {e}")
        # Si falla Keycloak, retornar lo de la BD
        return {
            "cedula": db_data.get("cedula", ""),
            "telefono": db_data.get("telefono", ""),
            "sector": db_data.get("sector", ""),
            "id_sector": db_data.get("id_sector"),
        }

@router.put("/mi-perfil", summary="Actualizar Perfil (Doble Sincronización)")
async def actualizar_mi_perfil(payload: PerfilUpdate, current_user: dict = Depends(get_current_user)):
    """
    **Actualización de Perfil (Doble Sincronización)**
    
    Actualiza el teléfono y el sector del usuario logueado:
    1. En la base de datos PostgreSQL (`usuarios`).
    2. En el servidor de Keycloak (como atributos personalizados).
    """
    keycloak_id = current_user.get("sub")
    if not keycloak_id:
        raise HTTPException(status_code=401, detail="Usuario no autenticado correctamente.")

    # 1. Obtener nombre del sector si viene id_sector
    sector_nombre = None
    if payload.id_sector is not None:
        query_sector = "SELECT nombre FROM sectores WHERE id = :id"
        row_sector = await database.fetch_one(query=query_sector, values={"id": payload.id_sector})
        if not row_sector:
            raise HTTPException(status_code=400, detail="Sector inválido")
        sector_nombre = row_sector["nombre"]

    # 2. Actualizar en Base de Datos PostgreSQL
    update_fields = []
    values = {"keycloak_id": keycloak_id}

    if payload.telefono is not None:
        update_fields.append("telefono = :telefono")
        values["telefono"] = payload.telefono
    if payload.id_sector is not None:
        update_fields.append("id_sector = :id_sector")
        values["id_sector"] = payload.id_sector

    if update_fields:
        query_update = f"UPDATE usuarios SET {', '.join(update_fields)} WHERE keycloak_id = :keycloak_id"
        await database.execute(query=query_update, values=values)

    # 3. Actualizar en Keycloak Admin API
    try:
        admin = get_keycloak_admin()
        user_info = admin.get_user(keycloak_id)
        
        attributes = user_info.get("attributes", {})
        if payload.telefono is not None:
            attributes["telefono"] = [payload.telefono]
        if sector_nombre is not None:
            attributes["sector"] = [sector_nombre]
            
        user_info["attributes"] = attributes
        
        admin.update_user(user_id=keycloak_id, payload=user_info)
    except Exception as e:
        # Nota: Idealmente habría compensación de transacciones si falla Keycloak,
        # pero para esta fase logueamos y lanzamos error.
        raise HTTPException(status_code=500, detail=f"Error sincronizando con Keycloak: {str(e)}")

    return {"status": "success", "message": "Perfil actualizado correctamente en la base de datos y Keycloak"}
