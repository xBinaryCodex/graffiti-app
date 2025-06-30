from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    This is how professional apps manage configuration!
    """
    # App settings
    app_name: str = "Graffiti App"
    debug: bool = True
    
    # Database settings (we'll use these later)
    database_url: Optional[str] = "sqlite:///./graffiti_app.db"  # SQLite for development
    
    # Security settings
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # File upload settings
    max_upload_size: int = 5 * 1024 * 1024  # 5MB
    allowed_extensions: set = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    
    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        # This tells pydantic to read from .env file
        env_file = ".env"

# Create a single instance to use throughout the app
settings = Settings()