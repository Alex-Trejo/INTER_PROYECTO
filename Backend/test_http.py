import requests
try:
    response = requests.get("http://172.20.10.2:8080/", timeout=3)
    print("STATUS:", response.status_code)
except Exception as e:
    print("ERROR:", e)
