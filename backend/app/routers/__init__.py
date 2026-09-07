from app.routers.listings import router as listings_router
from app.routers.bookings import router as bookings_router
from app.routers.host import router as host_router
from app.routers.wishlists import router as wishlists_router
from app.routers.users import router as users_router

__all__ = [
    "listings_router",
    "bookings_router",
    "host_router",
    "wishlists_router",
    "users_router",
]
