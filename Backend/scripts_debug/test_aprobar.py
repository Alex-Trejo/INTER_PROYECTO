import asyncio
import uuid
import sys
from core.security import get_keycloak_admin
from database.connection import database

async def main():
    await database.connect()
    try:
        user_id = 'fa9a1ba5-b201-46e9-92a1-245344e6eea9'
        admin = get_keycloak_admin()
        user_info = admin.get_user(user_id)
        print('User:', user_info)
        attributes = user_info.get('attributes', {})
        attributes['cedula'] = ['123']
        attributes['telefono'] = ['123']
        attributes['sector'] = ['Sector Test']
        
        update_payload = {'enabled': True, 'attributes': attributes}
        admin.update_user(user_id=user_id, payload=update_payload)
        print('Updated user in Keycloak')
        
        realm_role = admin.get_realm_role('Comunero')
        admin.assign_realm_roles(user_id=user_id, roles=[realm_role])
        print('Assigned role')
        
        nombres = f"{user_info.get('firstName', '')} {user_info.get('lastName', '')}".strip()
        email = user_info.get('email', '')
        
        row = await database.fetch_one('SELECT id FROM usuarios WHERE keycloak_id = :k', {'k': user_id})
        print('DB Row:', row)
        
        if row:
            print("Row exists, doing UPDATE")
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
                "cedula": "123",
                "telefono": "123",
                "id_sector": 1
            })
        else:
            print("Row does not exist, doing INSERT")
            query = """
                INSERT INTO usuarios (keycloak_id, cedula, nombres, telefono, email, id_rol, id_sector, estado_membresia)
                VALUES (:keycloak_id, :cedula, :nombres, :telefono, :email, 2, :id_sector, 'APROBADO')
            """
            await database.execute(query=query, values={
                "keycloak_id": user_id,
                "cedula": "123" or str(uuid.uuid4())[:15],
                "nombres": nombres,
                "telefono": "123",
                "email": email,
                "id_sector": 1
            })
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
