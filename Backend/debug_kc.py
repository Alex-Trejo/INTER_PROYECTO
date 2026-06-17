import asyncio
from keycloak import KeycloakAdmin
from core.config import settings

def run():
    try:
        admin = KeycloakAdmin(
            server_url=f"{settings.KEYCLOAK_SERVER_URL}/",
            username=settings.KEYCLOAK_ADMIN_USER,
            password=settings.KEYCLOAK_ADMIN_PASSWORD,
            realm_name=settings.KEYCLOAK_REALM,
            user_realm_name="master",
            client_id="admin-cli",
            verify=True,
        )
        print("Using:", settings.KEYCLOAK_ADMIN_USER, settings.KEYCLOAK_ADMIN_PASSWORD)
        users = admin.get_users()
        print(f"Users found: {len(users)}")
    except Exception as e:
        print(f"Error: {repr(e)}")

if __name__ == "__main__":
    run()
