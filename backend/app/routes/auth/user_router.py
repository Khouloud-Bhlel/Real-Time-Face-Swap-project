from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from typing import List

from ...models.users import UserResponse, UserProfileUpdate
from ...models.users import user_db, oauth2_scheme, decode_token
from ...config import settings

router = APIRouter()

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = user_db.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
        
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        created_at=user.created_at,
        last_login=user.last_login,
        is_active=user.is_active
    )

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get the current user's profile."""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserProfileUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update the current user's profile."""
    updated_user = user_db.update_user(current_user.id, user_update.dict(exclude_none=True))
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user