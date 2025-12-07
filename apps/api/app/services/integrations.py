from sqlalchemy.orm import Session
from app.models.user import Integration, Webhook
from app.schemas.auth import User
import uuid
import json
from datetime import datetime

class IntegrationService:
    @staticmethod
    def list_integrations(db: Session, tenant_id: str):
        return db.query(Integration).filter(Integration.tenantId == tenant_id).all()

    @staticmethod
    def create_integration(db: Session, integration_data: dict, user: User):
        # In a real app, we would encrypt credentials here
        credentials = integration_data.get("credentials", {})
        
        db_integration = Integration(
            id=str(uuid.uuid4()),
            name=integration_data["name"],
            providerId=integration_data["providerId"],
            category=integration_data["category"],
            config=integration_data.get("config", {}),
            credentials=credentials,
            tenantId=user.tenantId,
            status="active"
        )
        db.add(db_integration)
        db.commit()
        db.refresh(db_integration)
        return db_integration

    @staticmethod
    def get_integration(db: Session, integration_id: str, tenant_id: str):
        return db.query(Integration).filter(
            Integration.id == integration_id,
            Integration.tenantId == tenant_id
        ).first()

    @staticmethod
    def update_integration(db: Session, integration_id: str, integration_data: dict, tenant_id: str):
        db_integration = IntegrationService.get_integration(db, integration_id, tenant_id)
        if not db_integration:
            return None
        
        for key, value in integration_data.items():
            if hasattr(db_integration, key):
                setattr(db_integration, key, value)
        
        db.commit()
        db.refresh(db_integration)
        return db_integration

    @staticmethod
    def delete_integration(db: Session, integration_id: str, tenant_id: str):
        db_integration = IntegrationService.get_integration(db, integration_id, tenant_id)
        if not db_integration:
            return False
        
        db.delete(db_integration)
        db.commit()
        return True

    @staticmethod
    def create_webhook(db: Session, integration_id: str, webhook_data: dict):
        db_webhook = Webhook(
            id=str(uuid.uuid4()),
            integrationId=integration_id,
            url=webhook_data["url"],
            secret=webhook_data.get("secret"),
            events=webhook_data.get("events", []),
            isActive=True
        )
        db.add(db_webhook)
        db.commit()
        db.refresh(db_webhook)
        return db_webhook
