import requests
import json

api_key = "be6f6dae325944198670f3c839296c93.r6HKH9noaFfcnSUA"
url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "glm-4.6v",
    "messages": [
        {"role": "user", "content": "你好"}
    ]
}

response = requests.post(url, headers=headers, json=data, timeout=30)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")
