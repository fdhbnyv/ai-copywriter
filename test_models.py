import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests

api_key = "sk-VGuQm73tei71eAzApi8nlPwPPoOdiu2meHAVDNX5bztXxQJ2"
base_url = "https://api.manxiaobai.online"

models_to_try_chat = [
    "claude-3.5-sonnet", "claude-3-opus", "gpt-4", "gpt-4-turbo", 
    "gpt-3.5-turbo", "glm-4", "glm-4v", "qwen", "deepseek-chat",
    "gpt-4o-mini", "claude-3-haiku", "gpt-4o", "qwen2.5-72b",
]

models_to_try_image = [
    "dall-e-3", "dall-e-2", "stable-diffusion", "midjourney",
    "cogview-4", "cogview", "flux", "flux-pro", "sdxl", "sdxl-turbo",
]

headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

print("=== Testing Chat Models ===")
for model in models_to_try_chat:
    try:
        data = {"model": model, "messages": [{"role": "user", "content": "hi"}]}
        r = requests.post(f"{base_url}/v1/chat/completions", headers=headers, json=data, timeout=10)
        if r.status_code == 200:
            print(f"OK  {model}")
        else:
            err = r.json().get('error', {})
            msg = err.get('message', '')[:80]
            print(f"NO  {model}: {msg}")
    except Exception as e:
        print(f"ERR {model}: {str(e)[:60]}")

print("\n=== Testing Image Models ===")
for model in models_to_try_image:
    try:
        data = {"model": model, "prompt": "cat", "n": 1, "size": "1024x1024"}
        r = requests.post(f"{base_url}/v1/images/generations", headers=headers, json=data, timeout=10)
        if r.status_code == 200:
            print(f"OK  {model}")
        else:
            err = r.json().get('error', {})
            msg = err.get('message', '')[:80]
            if 'group default' in msg:
                print(f"SKIP {model}: no channel")
            else:
                print(f"NO  {model}: {msg}")
    except Exception as e:
        print(f"ERR {model}: {str(e)[:60]}")
