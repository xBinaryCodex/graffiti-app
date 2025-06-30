from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .models import PieceType, Surface

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    tag_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    crew: Optional[str] = Field(None, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    tag_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    crew: Optional[str] = Field(None, max_length=50)

class User(UserBase):
    id: int
    is_active: bool
    is_premium: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Piece Schemas
class PieceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    piece_type: PieceType
    surface: Surface
    location: Optional[str] = Field(None, max_length=200)
    is_public: bool = True

class PieceCreate(PieceBase):
    pass

class Piece(PieceBase):
    id: int
    image_url: str
    thumbnail_url: Optional[str]
    artist_id: int
    created_at: datetime
    artist: User
    
    class Config:
        from_attributes = True

class PieceWithStats(Piece):
    likes_count: int = 0
    comments_count: int = 0
    is_liked_by_user: bool = False

# Comment Schemas
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    piece_id: int

class Comment(CommentBase):
    id: int
    author_id: int
    piece_id: int
    created_at: datetime
    author: User
    
    class Config:
        from_attributes = True

# Like Schemas
class LikeCreate(BaseModel):
    piece_id: int

class Like(BaseModel):
    id: int
    user_id: int
    piece_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Competition Schemas
class CompetitionBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    letters: str = Field(..., max_length=10)
    theme: Optional[str] = Field(None, max_length=100)
    style_requirement: Optional[str] = Field(None, max_length=100)
    start_date: datetime
    end_date: datetime

class CompetitionCreate(CompetitionBase):
    pass

class Competition(CompetitionBase):
    id: int
    created_at: datetime
    entries_count: int = 0
    
    class Config:
        from_attributes = True

# Response Models
class MessageResponse(BaseModel):
    message: str

class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    per_page: int
    total_pages: int