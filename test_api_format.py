import requests
import json

api_key = "sk-VGuQm73tei71eAzApi8nlPwPPoOdiu2meHAVDNX5bztXxQJ2"
base_url = "https://api.manxiaobai.online"

# Test 1: Chat completion
print("=== Test 1: Chat Completion ===")
try:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {"model": "gpt-4o", "messages": [{"role": "user", "content": "hello"}]}
    r = requests.post(f"{base_url}/v1/chat/completions", headers=headers, json=data, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Response: {r.json()['choices'][0]['message']['content'][:200]}")
    else:
        print(f"Error: {r.text[:300]}")
except Exception as e:
    print(f"Exception: {e}")

# Test 2: Image generation
print("\n=== Test 2: Image Generation ===")
try:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {"model": "dall-e-3", "prompt": "a cute cat", "n": 1, "size": "1024x1024"}
    r = requests.post(f"{base_url}/v1/images/generations", headers=headers, json=data, timeout=60)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"Response keys: {list(result.keys())}")
        if 'data' in result and len(result['data']) > 0:
            print(f"Image URL: {result['data'][0].get('url', 'N/A')[:100]}")
    else:
        print(f"Error: {r.text[:500]}")
except Exception as e:
    print(f"Exception: {e}")
