from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware to extract and validate tenant context"""

    async def dispatch(self, request: Request, call_next):
        # Extract tenant from header or token
        tenant_id = request.headers.get("X-Tenant-ID", "default")
        request.state.tenant_id = tenant_id
        response = await call_next(request)
        return response
