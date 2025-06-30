from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine
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
    allow_origins=[settings.frontend_url],  # React app URL from config
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

# Test endpoint to check API is working
@app.get("/api/test")
def test_endpoint():
    """Test endpoint to verify API routing"""
    return {"message": "API is working!", "endpoint": "/api/test"}