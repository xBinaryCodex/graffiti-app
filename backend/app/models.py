from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

# This creates the base class for all our database models
Base = declarative_base()

# Enums for our categories
class PieceType(str, enum.Enum):
    """Types of graffiti pieces"""
    TAG = "tag"
    THROWIE = "throwie"
    HOLLOW = "hollow"
    STRAIGHT_LETTER = "straight_letter"
    PIECE = "piece"
    BLOCKBUSTER = "blockbuster"
    WILDSTYLE = "wildstyle"
    STENCIL = "stencil"
    WHEATPASTE = "wheatpaste"
    STICKER = "sticker"
    DIGITAL = "digital"
    SKETCH = "sketch"

class Surface(str, enum.Enum):
    """Surface/medium types"""
    WALL = "wall"
    TRAIN = "train"
    CANVAS = "canvas"
    BLACKBOOK = "blackbook"
    DIGITAL = "digital"
    STICKER = "sticker"
    POSTER = "poster"
    OTHER = "other"

# Database Models
class User(Base):
    """User model - represents a graffiti artist"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    
    # Profile info
    tag_name = Column(String(50))  # Artist's graffiti name
    bio = Column(Text)
    location = Column(String(100))
    crew = Column(String(50))  # Graffiti crew affiliation
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    pieces = relationship("Piece", back_populates="artist", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")

class Piece(Base):
    """Piece model - represents a graffiti artwork"""
    __tablename__ = "pieces"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Categorization
    piece_type = Column(Enum(PieceType), nullable=False)
    surface = Column(Enum(Surface), nullable=False)
    
    # File info
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    
    # Metadata
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    location = Column(String(200))  # Optional location info
    
    # Foreign keys
    artist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    artist = relationship("User", back_populates="pieces")
    comments = relationship("Comment", back_populates="piece", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="piece", cascade="all, delete-orphan")
    competition_entries = relationship("CompetitionEntry", back_populates="piece")

class Comment(Base):
    """Comment model - for piece feedback"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    piece_id = Column(Integer, ForeignKey("pieces.id"), nullable=False)
    
    # Relationships
    author = relationship("User", back_populates="comments")
    piece = relationship("Piece", back_populates="comments")

class Like(Base):
    """Like model - for piece appreciation"""
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    piece_id = Column(Integer, ForeignKey("pieces.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="likes")
    piece = relationship("Piece", back_populates="likes")

class Competition(Base):
    """Competition model - monthly challenges"""
    __tablename__ = "competitions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Competition details
    letters = Column(String(10))  # The random 3-4 letters
    theme = Column(String(100))   # e.g., "underwater", "space"
    style_requirement = Column(String(100))  # e.g., "wildstyle", "bubble"
    
    # Dates
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    entries = relationship("CompetitionEntry", back_populates="competition")

class CompetitionEntry(Base):
    """Competition entry model - links pieces to competitions"""
    __tablename__ = "competition_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    votes = Column(Integer, default=0)
    
    # Foreign keys
    competition_id = Column(Integer, ForeignKey("competitions.id"), nullable=False)
    piece_id = Column(Integer, ForeignKey("pieces.id"), nullable=False)
    
    # Relationships
    competition = relationship("Competition", back_populates="entries")
    piece = relationship("Piece", back_populates="competition_entries")