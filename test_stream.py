import requests
import json

url = "https://ai-copywriter-production-74a7.up.railway.app/api/generate-text"
data = {"product": "蓝牙耳机", "features": "降噪", "tone": "professional", "audience": "年轻人", "platform": "xiaohongshu"}

print("Testing streaming API...")
response = requests.post(url, json=data, timeout=60, stream=True)
print(f"Status: {response.status_code}")

for line in response.iter_lines():
    if line:
        print(f"Line: {line.decode('utf-8')}")
