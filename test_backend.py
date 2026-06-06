import requests
import json

url = "https://ai-copywriter-production-74a7.up.railway.app/api/generate-text"
data = {"product": "蓝牙耳机", "features": "降噪", "tone": "professional"}

response = requests.post(url, json=data, timeout=60)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:1000]}")
