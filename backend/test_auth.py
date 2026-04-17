import requests

print("Registering...")
res_reg = requests.post("http://127.0.0.1:8000/api/auth/register", json={
    "name": "Test User",
    "email": "test-auth-1234@example.com",
    "password": "password123!",
    "phone": "1234567890",
    "language": "en"
})
print("Reg status:", res_reg.status_code, res_reg.text)

print("Logging in...")
res_log = requests.post("http://127.0.0.1:8000/api/auth/login", json={
    "email": "test-auth-1234@example.com",
    "password": "password123!"
})
print("Log status:", res_log.status_code, res_log.text)
