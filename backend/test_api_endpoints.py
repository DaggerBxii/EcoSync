import requests
import json

# Base URL for the backend
BASE_URL = "http://localhost:8000"

def test_endpoints():
    print("Testing EcoSync Backend API endpoints...\n")
    
    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✓ Health endpoint: {response.status_code}")
        print(f"  Response: {response.json()}\n")
    except Exception as e:
        print(f"✗ Health endpoint failed: {e}\n")
    
    # Test AI info endpoint
    try:
        response = requests.get(f"{BASE_URL}/ai/info")
        print(f"✓ AI Info endpoint: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"✗ AI Info endpoint failed: {e}\n")
    
    # Test metrics endpoint
    try:
        response = requests.get(f"{BASE_URL}/metrics")
        print(f"✓ Metrics endpoint: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"✗ Metrics endpoint failed: {e}\n")
    
    # Test anomalies endpoint
    try:
        response = requests.get(f"{BASE_URL}/anomalies")
        print(f"✓ Anomalies endpoint: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"✗ Anomalies endpoint failed: {e}\n")
    
    # Test status endpoint
    try:
        response = requests.get(f"{BASE_URL}/status")
        print(f"✓ Status endpoint: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"✗ Status endpoint failed: {e}\n")

if __name__ == "__main__":
    test_endpoints()