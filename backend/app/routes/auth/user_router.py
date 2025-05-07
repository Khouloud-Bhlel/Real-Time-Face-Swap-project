from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ...models.users import UserResponse, UserProfileUpdate, UserInDB
from ...models.users.auth import get_current_user
from ...models.users.database import user_db_service

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: UserInDB = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user.to_response()

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Update current user's profile."""
    updated_user = await user_db_service.update_user(current_user.id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user

@router.get("/", response_model=List[UserResponse])
async def list_users(current_user: UserInDB = Depends(get_current_user)):
    """List all users. Requires authentication."""
    return await user_db_service.list_users()

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(current_user: UserInDB = Depends(get_current_user)):
    """Delete current user account."""
    success = await user_db_service.delete_user(current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"detail": "User deleted successfully"}