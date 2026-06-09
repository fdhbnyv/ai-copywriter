import sys, requests, json, time
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://api.manxiaobai.online/v1/images/generations'
headers = {'Authorization': 'Bearer sk-VGuQm73tei71eAzApi8nlPwPPoOdiu2meHAVDNX5bztXxQJ2', 'Content-Type': 'application/json'}
data = {'model': 'gpt-image-2', 'prompt': 'a cute cat sitting on a desk, digital art', 'n': 1, 'size': '1024x1024'}

print(f"Request: {json.dumps(data)}")
print("Waiting for response (up to 180s)...")
start = time.time()
r = requests.post(url, headers=headers, json=data, timeout=180)
elapsed = time.time() - start
print(f"Status: {r.status_code} ({elapsed:.1f}s)")
print(f"Response: {r.text[:500]}")
