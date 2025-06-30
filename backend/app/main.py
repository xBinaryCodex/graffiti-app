from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import engine, get_db
from . import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI instance
app = FastAPI(
    title=settings.app_name,
    description="Backend API for the Graffiti Artists Platform",
    version="0.1.0",
    debug=settings.debug
)

# Configure CORS (allows your frontend to talk to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app URL from config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    """Welcome endpoint - checks if API is running"""
    return {
        "message": "Welcome to Graffiti App API",
        "version": "0.1.0",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

# Include routers
from .routers import auth, users, pieces, comments

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pieces.router)
app.include_router(comments.router)

# Serve uploaded files (in production, use a proper file server)
from fastapi.staticfiles import StaticFiles
import os

uploads_path = os.path.join(os.path.dirname(__file__), "..", "uploads")
if os.path.exists(uploads_path):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")