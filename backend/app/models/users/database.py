import uuid
from datetime import datetime
from typing import Dict, List, Optional
import json
import os
from fastapi import HTTPException, status

from .models import UserCreate, UserInDB, UserResponse
from .auth import get_password_hash, verify_password
from ...config import settings

# Simple file-based database for demonstration purposes
# In production, use a real database like PostgreSQL or MongoDB
class UserDB:
    def __init__(self):
        self.db_file = os.path.join(os.path.dirname(__file__), "users.json")
        self.users: Dict[str, UserInDB] = {}
        self.load_users()

    def load_users(self):
        """Load users from the JSON file."""
        try:
            if os.path.exists(self.db_file):
                with open(self.db_file, "r") as f:
                    users_dict = json.load(f)
                    for user_id, user_data in users_dict.items():
                        # Convert string dates to datetime objects
                        if 'created_at' in user_data:
                            user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
                        if 'last_login' in user_data and user_data['last_login']:
                            user_data['last_login'] = datetime.fromisoformat(user_data['last_login'])
                        self.users[user_id] = UserInDB(**user_data)
        except Exception as e:
            print(f"Error loading users: {str(e)}")
            # Initialize with empty dict if there's an error
            self.users = {}

    def save_users(self):
        """Save users to the JSON file."""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.db_file), exist_ok=True)
            
            # Convert users to dict with datetime objects as strings
            users_dict = {}
            for user_id, user in self.users.items():
                # Convert to dict and manually handle datetime objects
                user_dict = user.dict()
                if 'created_at' in user_dict:
                    user_dict['created_at'] = user_dict['created_at'].isoformat()
                if 'last_login' in user_dict and user_dict['last_login']:
                    user_dict['last_login'] = user_dict['last_login'].isoformat()
                
                users_dict[user_id] = user_dict
                
            with open(self.db_file, "w") as f:
                json.dump(users_dict, f, indent=2)
        except Exception as e:
            print(f"Error saving users: {str(e)}")

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get a user by their email address."""
        for user in self.users.values():
            if user.email.lower() == email.lower():
                return user
        return None

    def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get a user by their ID."""
        return self.users.get(user_id)

    def create_user(self, user: UserCreate) -> UserResponse:
        """Create a new user."""
        # Check if email already exists
        if self.get_user_by_email(user.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user with hashed password
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user.password)
        
        db_user = UserInDB(
            id=user_id,
            email=user.email,
            username=user.username,
            created_at=datetime.utcnow(),
            hashed_password=hashed_password,
            is_active=True
        )
        
        # Save to database
        self.users[user_id] = db_user
        self.save_users()
        
        # Return user without password hash
        return UserResponse(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            created_at=db_user.created_at,
            is_active=db_user.is_active
        )

    def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate a user by email and password."""
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
            
        # Update last login time
        user.last_login = datetime.utcnow()
        self.save_users()
        
        return user

    def update_user(self, user_id: str, update_data: dict) -> Optional[UserResponse]:
        """Update a user's profile."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
            
        # Update fields
        for key, value in update_data.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
                
        self.save_users()
        
        # Return updated user without password hash
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            created_at=user.created_at,
            last_login=user.last_login,
            is_active=user.is_active
        )

    def list_users(self) -> List[UserResponse]:
        """List all users."""
        return [
            UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                created_at=user.created_at,
                last_login=user.last_login,
                is_active=user.is_active
            )
            for user in self.users.values()
        ]

    def delete_user(self, user_id: str) -> bool:
        """Delete a user."""
        if user_id in self.users:
            del self.users[user_id]
            self.save_users()
            return True
        return False


# Create global instance
user_db = UserDB()