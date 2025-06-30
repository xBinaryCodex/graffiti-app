from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db
from ..models import PieceType

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get list of users with optional search"""
    query = db.query(models.User)
    
    if search:
        query = query.filter(
            (models.User.username.contains(search)) |
            (models.User.tag_name.contains(search)) |
            (models.User.crew.contains(search))
        )
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{username}", response_model=schemas.User)
def read_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get a specific user by username"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{username}/pieces", response_model=List[schemas.Piece])
def read_user_pieces(
    username: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    piece_type: Optional[PieceType] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get pieces by a specific user"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = db.query(models.Piece).filter(models.Piece.artist_id == user.id)
    
    # Only show public pieces unless it's the user's own profile
    if current_user.id != user.id:
        query = query.filter(models.Piece.is_public == True)
    
    if piece_type:
        query = query.filter(models.Piece.piece_type == piece_type)
    
    pieces = query.offset(skip).limit(limit).all()
    return pieces