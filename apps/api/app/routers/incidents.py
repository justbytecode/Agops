from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.incident import IncidentCreate, IncidentResponse, IncidentUpdate
from app.models.incident import Incident
from app.utils import get_db

router = APIRouter()


@router.get("", response_model=List[IncidentResponse])
async def list_incidents(db: Session = Depends(get_db)):
    """List all incidents"""
    incidents = db.query(Incident).all()
    return incidents


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(incident_data: IncidentCreate, db: Session = Depends(get_db)):
    """Create a new incident"""
    # TODO: Get tenant_id from authenticated user
    incident = Incident(**incident_data.dict(), tenant_id="default")
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get incident by ID"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str, incident_data: IncidentUpdate, db: Session = Depends(get_db)
):
    """Update an incident"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    for key, value in incident_data.dict(exclude_unset=True).items():
        setattr(incident, key, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(incident_id: str, db: Session = Depends(get_db)):
    """Delete an incident"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    db.delete(incident)
    db.commit()
