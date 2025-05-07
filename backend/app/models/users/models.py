from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    username: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "password": "securepassword123"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (returned to client)."""
    id: str
    email: EmailStr
    username: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "1234abcd",
                "email": "user@example.com",
                "username": "johndoe",
                "created_at": "2025-05-07T12:00:00",
                "last_login": "2025-05-07T12:00:00",
                "is_active": True
            }
        }


class UserInDB(UserResponse):
    """Schema for user in database (includes hashed password)."""
    hashed_password: str
    
    
class Token(BaseModel):
    """Schema for JWT token."""
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }
        

class TokenData(BaseModel):
    """Schema for JWT token payload."""
    sub: str  # User ID
    exp: Optional[datetime] = None
    
    
class UserProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None