from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/api/comments",
    tags=["comments"]
)

@router.post("/", response_model=schemas.Comment)
def create_comment(
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Add a comment to a piece"""
    # Check if piece exists
    piece = db.query(models.Piece).filter(models.Piece.id == comment.piece_id).first()
    if not piece:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    # Check if piece is public or belongs to user
    if not piece.is_public and piece.artist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot comment on private piece")
    
    # Create comment
    db_comment = models.Comment(
        content=comment.content,
        piece_id=comment.piece_id,
        author_id=current_user.id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/piece/{piece_id}", response_model=List[schemas.Comment])
def get_piece_comments(
    piece_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all comments for a piece"""
    # Check if piece exists and is public
    piece = db.query(models.Piece).filter(models.Piece.id == piece_id).first()
    if not piece:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    if not piece.is_public:
        raise HTTPException(status_code=403, detail="Cannot view comments on private piece")
    
    comments = db.query(models.Comment)\
        .filter(models.Comment.piece_id == piece_id)\
        .order_by(models.Comment.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return comments

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Delete a comment (only by author or piece owner)"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is comment author or piece owner
    piece = db.query(models.Piece).filter(models.Piece.id == comment.piece_id).first()
    if comment.author_id != current_user.id and piece.artist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}