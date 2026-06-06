import requests
import json

url = "https://ai-copywriter-production-74a7.up.railway.app/api/generate-text"
data = {"product": "蓝牙耳机", "features": "降噪", "tone": "professional", "audience": "年轻人", "platform": "xiaohongshu"}

print("Testing API...")
response = requests.post(url, json=data, timeout=60)
print(f"Status: {response.status_code}")
print(f"Content-Type: {response.headers.get('content-type')}")
print(f"Response length: {len(response.text)}")

# Check if it's SSE or JSON
if 'text/event-stream' in response.headers.get('content-type', ''):
    print("Format: SSE (Streaming)")
    for line in response.text.split('\n')[:5]:
        print(f"  {line}")
else:
    print("Format: JSON")
    try:
        data = response.json()
        if 'copywriting' in data:
            print(f"  copywriting length: {len(data['copywriting'])}")
            print(f"  First 100 chars: {data['copywriting'][:100]}")
    except:
        print(f"  Raw: {response.text[:200]}")
