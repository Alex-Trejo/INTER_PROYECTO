import requests
try:
    response = requests.get("http://192.168.50.6:8080/", timeout=3)
    print("STATUS:", response.status_code)
except Exception as e:
    print("ERROR:", e)
