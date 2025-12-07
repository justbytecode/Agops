from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.services.integrations import IntegrationService
from app.schemas.auth import User

router = APIRouter()

class IntegrationCreate(BaseModel):
    name: str
    providerId: str
    category: str
    config: Optional[dict] = {}
    credentials: Optional[dict] = {}

class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict] = None
    credentials: Optional[dict] = None
    status: Optional[str] = None

@router.get("/", response_model=List[dict])
def list_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    integrations = IntegrationService.list_integrations(db, current_user.tenantId)
    # Mask credentials in response
    result = []
    for integration in integrations:
        data = integration.__dict__
        if "credentials" in data:
            data["credentials"] = {"configured": True} if data["credentials"] else {"configured": False}
        result.append(data)
    return result

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_integration(
    integration: IntegrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return IntegrationService.create_integration(db, integration.dict(), current_user)

@router.get("/{integration_id}")
def get_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    integration = IntegrationService.get_integration(db, integration_id, current_user.tenantId)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration

@router.put("/{integration_id}")
def update_integration(
    integration_id: str,
    integration: IntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = IntegrationService.update_integration(
        db, integration_id, integration.dict(exclude_unset=True), current_user.tenantId
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Integration not found")
    return updated

@router.delete("/{integration_id}")
def delete_integration(
    integration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = IntegrationService.delete_integration(db, integration_id, current_user.tenantId)
    if not success:
        raise HTTPException(status_code=404, detail="Integration not found")
    return {"status": "success"}
