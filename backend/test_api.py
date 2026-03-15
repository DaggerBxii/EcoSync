"""
Quick test script for EcoSync Building Resource Management API
"""

import sys
sys.path.append('src')

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("✓ Health endpoint working")

def test_status():
    """Test status endpoint"""
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert "building_metrics" in data
    assert "alert_summary" in data
    print("✓ Status endpoint working")
    print(f"  - Zones: {data['building_metrics']['total_zones']}")
    print(f"  - Resources: {data['building_metrics']['total_resources']}")
    print(f"  - Active Alerts: {data['alert_summary']['active_alerts']}")

def test_zones():
    """Test zones endpoint"""
    response = client.get("/api/zones")
    assert response.status_code == 200
    data = response.json()
    assert "zones" in data
    print(f"✓ Zones endpoint working ({data['count']} zones)")

def test_resources():
    """Test resources endpoint"""
    response = client.get("/api/resources")
    assert response.status_code == 200
    data = response.json()
    assert "resources" in data
    print(f"✓ Resources endpoint working ({data['count']} resources)")

def test_alerts():
    """Test alerts endpoint"""
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    print(f"✓ Alerts endpoint working ({data['count']} alerts)")

def test_alert_summary():
    """Test alert summary endpoint"""
    response = client.get("/api/alerts/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_alerts" in data
    print("✓ Alert summary endpoint working")

def test_ai_info():
    """Test AI info endpoint"""
    response = client.get("/api/ai/info")
    assert response.status_code == 200
    data = response.json()
    assert "using_gemini" in data
    print(f"✓ AI info endpoint working (Gemini: {data['using_gemini']})")

def test_ai_recommendations():
    """Test AI recommendations endpoint"""
    response = client.get("/api/ai/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    print(f"✓ AI recommendations endpoint working ({len(data['recommendations'])} recommendations)")

def test_simulate_anomaly():
    """Test anomaly simulation"""
    response = client.post("/api/simulate/anomaly?resource_type=hvac&zone_id=office_a")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print(f"✓ Anomaly simulation working")
    print(f"  - Alert: {data['alert']['title']}")
    print(f"  - Severity: {data['alert']['severity']}")
    print(f"  - Status: {data['alert']['status']}")

def test_technician_alerts():
    """Test technician alerts endpoint"""
    response = client.get("/api/alerts/technician")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    print(f"✓ Technician alerts endpoint working ({data['count']} escalated)")

if __name__ == "__main__":
    print("=" * 60)
    print("EcoSync Building Resource Management API Tests")
    print("=" * 60)
    
    try:
        test_health()
        test_status()
        test_zones()
        test_resources()
        test_alerts()
        test_alert_summary()
        test_ai_info()
        test_ai_recommendations()
        test_simulate_anomaly()
        test_technician_alerts()
        
        print("=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
