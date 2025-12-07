from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def get_metrics():
    """Get system metrics"""
    return {"metrics": []}
