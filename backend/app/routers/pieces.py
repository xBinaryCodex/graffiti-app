from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
import uuid
from datetime import datetime
from .. import models, schemas, auth
from ..database import get_db
from ..config import settings
from ..models import PieceType, Surface

router = APIRouter(
    prefix="/api/pieces",
    tags=["pieces"]
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return the URL"""
    # Generate unique filename
    file_extension = os.path.splitext(upload_file.filename)[1]
    if file_extension.lower() not in settings.allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_extension} not allowed")
    
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(upload_file.file.read())
    
    # Return relative URL (in production, this would be a full URL)
    return f"/uploads/{unique_filename}"

@router.post("/", response_model=schemas.Piece)
async def create_piece(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    piece_type: PieceType = Form(...),
    surface: Surface = Form(...),
    location: Optional[str] = Form(None),
    is_public: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Upload a new piece"""
    # Check file size
    contents = await image.read()
    await image.seek(0)  # Reset file pointer
    
    if len(contents) > settings.max_upload_size:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Save image
    try:
        image_url = save_upload_file(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save file")
    
    # Create piece in database
    db_piece = models.Piece(
        title=title,
        description=description,
        piece_type=piece_type,
        surface=surface,
        location=location,
        is_public=is_public,
        image_url=image_url,
        artist_id=current_user.id
    )
    
    db.add(db_piece)
    db.commit()
    db.refresh(db_piece)
    return db_piece

@router.get("/", response_model=List[schemas.PieceWithStats])
def read_pieces(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    piece_type: Optional[PieceType] = None,
    surface: Optional[Surface] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    """Get list of public pieces with optional filters"""
    query = db.query(models.Piece).filter(models.Piece.is_public == True)
    
    if piece_type:
        query = query.filter(models.Piece.piece_type == piece_type)
    
    if surface:
        query = query.filter(models.Piece.surface == surface)
    
    if search:
        query = query.join(models.User).filter(
            (models.Piece.title.contains(search)) |
            (models.Piece.description.contains(search)) |
            (models.User.username.contains(search)) |
            (models.User.tag_name.contains(search))
        )
    
    pieces = query.order_by(models.Piece.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add stats to each piece
    pieces_with_stats = []
    for piece in pieces:
        likes_count = db.query(models.Like).filter(models.Like.piece_id == piece.id).count()
        comments_count = db.query(models.Comment).filter(models.Comment.piece_id == piece.id).count()
        is_liked_by_user = False
        
        if current_user:
            is_liked_by_user = db.query(models.Like).filter(
                models.Like.piece_id == piece.id,
                models.Like.user_id == current_user.id
            ).first() is not None
        
        piece_dict = piece.__dict__.copy()
        piece_dict['likes_count'] = likes_count
        piece_dict['comments_count'] = comments_count
        piece_dict['is_liked_by_user'] = is_liked_by_user
        piece_dict['artist'] = piece.artist
        
        pieces_with_stats.append(schemas.PieceWithStats(**piece_dict))
    
    return pieces_with_stats

@router.get("/{piece_id}", response_model=schemas.PieceWithStats)
def read_piece(
    piece_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    """Get a specific piece by ID"""
    piece = db.query(models.Piece).filter(models.Piece.id == piece_id).first()
    
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    # Check if piece is public or belongs to current user
    if not piece.is_public and (not current_user or current_user.id != piece.artist_id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Add stats
    likes_count = db.query(models.Like).filter(models.Like.piece_id == piece.id).count()
    comments_count = db.query(models.Comment).filter(models.Comment.piece_id == piece.id).count()
    is_liked_by_user = False
    
    if current_user:
        is_liked_by_user = db.query(models.Like).filter(
            models.Like.piece_id == piece.id,
            models.Like.user_id == current_user.id
        ).first() is not None
    
    piece_dict = piece.__dict__.copy()
    piece_dict['likes_count'] = likes_count
    piece_dict['comments_count'] = comments_count
    piece_dict['is_liked_by_user'] = is_liked_by_user
    piece_dict['artist'] = piece.artist
    
    return schemas.PieceWithStats(**piece_dict)

@router.delete("/{piece_id}")
def delete_piece(
    piece_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a piece (only by owner)"""
    piece = db.query(models.Piece).filter(models.Piece.id == piece_id).first()
    
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    if piece.artist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this piece")
    
    # Delete the file (in production, handle this more carefully)
    try:
        file_path = piece.image_url.replace("/uploads/", "")
        os.remove(os.path.join(UPLOAD_DIR, file_path))
    except:
        pass  # File might not exist
    
    db.delete(piece)
    db.commit()
    
    return {"message": "Piece deleted successfully"}

@router.post("/{piece_id}/like", response_model=schemas.MessageResponse)
def like_piece(
    piece_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Like a piece"""
    piece = db.query(models.Piece).filter(models.Piece.id == piece_id).first()
    if not piece:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    # Check if already liked
    existing_like = db.query(models.Like).filter(
        models.Like.piece_id == piece_id,
        models.Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="Already liked this piece")
    
    # Create like
    like = models.Like(piece_id=piece_id, user_id=current_user.id)
    db.add(like)
    db.commit()
    
    return {"message": "Piece liked successfully"}

@router.delete("/{piece_id}/like", response_model=schemas.MessageResponse)
def unlike_piece(
    piece_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Unlike a piece"""
    like = db.query(models.Like).filter(
        models.Like.piece_id == piece_id,
        models.Like.user_id == current_user.id
    ).first()
    
    if not like:
        raise HTTPException(status_code=400, detail="Not liked yet")
    
    db.delete(like)
    db.commit()
    
    return {"message": "Like removed successfully"}