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
        uris = mobile_client.get("redirectUris", [])
        
        exact_uris = [
            "chaskialerta://expo-auth-session",
            "com.chaskialerta.app://expo-auth-session"
        ]
        
        for uri in exact_uris:
            if uri not in uris:
                uris.append(uri)
                
        mobile_client["redirectUris"] = uris
        
        admin.update_client(mobile_client["id"], payload=mobile_client)
        print("EXITO: Se agregaron las URIs validas a Keycloak.")
    else:
        print("ERROR: Cliente mobile-app no encontrado.")
        
except Exception as e:
    print(f"ERROR: {e}")
