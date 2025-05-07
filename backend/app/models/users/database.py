from datetime import datetime
from typing import List, Optional, Union
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from fastapi import HTTPException, status

from .models import UserCreate, UserInDB, UserResponse, UserProfileUpdate
from ...config import settings

class MongoDBService:
    """MongoDB service for user management."""
    
    client: Optional[AsyncIOMotorClient] = None
    
    async def initialize(self):
        """Initialize MongoDB connection and models."""
        try:
            # Connect to MongoDB
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            
            # Initialize Beanie with the document models
            await init_beanie(
                database=self.client[settings.MONGODB_DB_NAME],
                document_models=[UserInDB]
            )
        except Exception as e:
            print(f"Error initializing MongoDB: {str(e)}")
            raise e
    
    async def close_connection(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get a user by their email address."""
        return await UserInDB.find_one({"email": email})
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get a user by their ID."""
        return await UserInDB.find_one({"id": user_id})
    
    async def create_user(self, user: UserCreate) -> UserResponse:
        """Create a new user."""
        from .auth import get_password_hash  # Local import to avoid circular dependency
        
        # Check if email already exists
        existing_user = await self.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password and create user
        hashed_password = get_password_hash(user.password)
        
        # Create new user document
        db_user = UserInDB(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            is_active=True
        )
        
        # Save to database
        await db_user.insert()
        
        # Return user without password hash
        return db_user.to_response()
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate a user by email and password."""
        from .auth import verify_password  # Local import to avoid circular dependency
        
        user = await self.get_user_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        # Update last login time
        user.last_login = datetime.utcnow()
        await user.save()
        
        return user
    
    async def update_user(self, user_id: str, update_data: UserProfileUpdate) -> Optional[UserResponse]:
        """Update a user's profile."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        
        # Update fields if provided
        if update_data.username:
            user.username = update_data.username
            
        if update_data.email:
            # Check if email is already taken by another user
            existing_user = await self.get_user_by_email(update_data.email)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered by another user"
                )
            user.email = update_data.email
        
        # Save changes
        await user.save()
        
        # Return updated user without password hash
        return user.to_response()
    
    async def list_users(self) -> List[UserResponse]:
        """List all users."""
        users = await UserInDB.find_all().to_list()
        return [user.to_response() for user in users]
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
            
        await user.delete()
        return True

# Create global instance
user_db_service = MongoDBService()