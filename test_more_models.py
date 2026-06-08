import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests

api_key = "sk-VGuQm73tei71eAzApi8nlPwPPoOdiu2meHAVDNX5bztXxQJ2"
base_url = "https://api.manxiaobai.online"

headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

# Try just the base chat completion to see if API works
print("=== Testing base endpoint ===")
try:
    r = requests.get(f"{base_url}/v1/dashboard/billing/usage", headers=headers, params={"start_date":"2026-06-01","end_date":"2026-06-08"}, timeout=10)
    print(f"Billing: {r.status_code} {r.text[:200]}")
except Exception as e:
    print(f"Billing error: {e}")

# Try different model names
more_models = [
    "gpt-4o-2024-08-06", "gpt-4o-2024-05-13", "gpt-4o-mini-2024-07-18",
    "claude-sonnet-4-20250514", "claude-4-sonnet", "deepseek-v3", "deepseek-r1",
    "gemini-2.0-flash", "gemini-2.0-pro", "o1-mini", "o1-preview"
]

print("\n=== More Chat Models ===")
for model in more_models:
    try:
        data = {"model": model, "messages": [{"role": "user", "content": "hi"}]}
        r = requests.post(f"{base_url}/v1/chat/completions", headers=headers, json=data, timeout=10)
        if r.status_code == 200:
            print(f"OK  {model}")
        else:
            err = r.json().get('error', {})
            msg = err.get('message', '')[:100]
            print(f"NO  {model}: {msg}")
    except Exception as e:
        print(f"ERR {model}: {str(e)[:60]}")

# Try image with more models
more_image = ["flux-1.1-pro", "flux-1.1", "imagen-3", "stable-diffusion-3.5", "recraft-v3"]
print("\n=== More Image Models ===")
for model in more_image:
    try:
        data = {"model": model, "prompt": "cat", "n": 1, "size": "1024x1024"}
        r = requests.post(f"{base_url}/v1/images/generations", headers=headers, json=data, timeout=15)
        if r.status_code == 200:
            print(f"OK  {model}")
        else:
            err = r.json().get('error', {})
            msg = err.get('message', '')[:100]
            print(f"NO  {model}: {msg}")
    except Exception as e:
        print(f"ERR {model}: {str(e)[:60]}")
