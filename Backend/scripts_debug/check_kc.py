import os
from keycloak import KeycloakAdmin
from dotenv import load_dotenv

load_dotenv()

try:
    admin = KeycloakAdmin(
        server_url=os.getenv("KEYCLOAK_SERVER_URL"),
        username=os.getenv("KEYCLOAK_ADMIN_USER"),
        password=os.getenv("KEYCLOAK_ADMIN_PASSWORD"),
        realm_name="chaski-realm",
        user_realm_name="master",
        verify=True
    )
    
    clients = admin.get_clients()
    mobile_client = next((c for c in clients if c["clientId"] == "mobile-app"), None)
    if mobile_client:
        print("Redirect URIs configuradas en Keycloak para mobile-app:")
        for uri in mobile_client.get("redirectUris", []):
            print(f"- {uri}")
    else:
        print("ERROR: Cliente no encontrado.")
        
except Exception as e:
    print(f"ERROR: {e}")
