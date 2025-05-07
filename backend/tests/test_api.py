import pytest
from fastapi.testclient import TestClient

def test_root_endpoint(client):
    """Test the root endpoint returns correct response."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Welcome to DeepFaceSwap AI API"

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"

def test_api_docs(client):
    """Test the API docs are accessible."""
    response = client.get("/api/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    
    response = client.get("/api/redoc")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]