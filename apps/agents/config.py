from pydantic import BaseSettings
from typing import Optional, Dict

class Settings(BaseSettings):
    # App
    APP_NAME: str = "AgentOps Agents"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_URL: str = "http://localhost:8000/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/agentops"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # LLM Providers
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Default Models
    DEFAULT_MODEL: str = "gpt-4-turbo"
    RCA_MODEL: str = "claude-3-opus"
    REMEDIATION_MODEL: str = "gpt-4-turbo"
    MONITORING_MODEL: str = "gpt-3.5-turbo"
    
    # Kubernetes
    KUBECONFIG_PATH: Optional[str] = None
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    class Config:
        env_file = ".env"

settings = Settings()
