import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from app.models.users import user_db
from app.routes.auth import get_current_user

@pytest.fixture
def test_user():
    """Create a test user for authentication tests."""
    # Clean up any existing test user
    for user in list(user_db.users.values()):
        if user.email == "testuser@example.com":
            user_db.delete_user(user.id)
    
    # Create new test user
    from app.models.users.models import UserCreate
    user_data = UserCreate(
        email="testuser@example.com",
        username="testuser",
        password="testpassword123"
    )
    created_user = user_db.create_user(user_data)
    
    yield created_user
    
    # Cleanup after tests
    for user in list(user_db.users.values()):
        if user.email == "testuser@example.com":
            user_db.delete_user(user.id)

def test_register_user(client):
    """Test registering a new user."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    
    # Clean up
    for user in list(user_db.users.values()):
        if user.email == "newuser@example.com":
            user_db.delete_user(user.id)

def test_login_user(client, test_user):
    """Test user login and JWT token generation."""
    # Test valid login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser@example.com",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Test invalid password
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_get_user_profile(client, test_user):
    """Test getting user profile with JWT authentication."""
    # First login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser@example.com",
            "password": "testpassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Get user profile with token
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["username"] == "testuser"

def test_unauthorized_access(client):
    """Test that protected endpoints require authentication."""
    # Try to access protected endpoint without token
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    
    # Try with invalid token
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401

def test_update_user_profile(client, test_user):
    """Test updating user profile."""
    # First login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser@example.com",
            "password": "testpassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Update username
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"username": "updateduser"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "updateduser"
    assert data["email"] == "testuser@example.com"