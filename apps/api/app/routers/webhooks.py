from fastapi import APIRouter, Request

router = APIRouter()


@router.post("")
async def handle_webhook(request: Request):
    """Handle incoming webhooks"""
    return {"status": "received"}
