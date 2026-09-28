import os

from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import HostelOpsException


from app.routers.users import router as users_router
from app.routers.hostels import router as hostels_router
from app.routers.blocks import router as blocks_router
from app.routers.rooms import router as rooms_router
from app.routers.room_assignments import router as room_assignments_router
from app.routers.complaints import router as complaints_router
from app.routers.complaint_categories import router as complaint_categories_router
from app.routers.technicians import router as technicians_router
from app.routers.technician_skills import router as technician_skills_router
from app.routers.notifications import router as notifications_router
from app.routers.dashboard import router as dashboard_router
from app.core.logging_config import setup_logging


setup_logging()


app = FastAPI(
    title="HostelOps API",
    description="Hostel Maintenance & Complaint Management Platform",
    version="1.0.0"
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HostelOpsException)
async def hostelops_exception_handler(
    request: Request,
    exc: HostelOpsException
):
    return JSONResponse(
        status_code=400,
        content={
            "detail": str(exc)
        }
    )

app.include_router(users_router)
app.include_router(hostels_router)
app.include_router(blocks_router)
app.include_router(rooms_router)
app.include_router(room_assignments_router)
app.include_router(complaints_router)
app.include_router(complaint_categories_router)
app.include_router(technicians_router)
app.include_router(technician_skills_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)



@app.get("/")
def root():
    return {
        "message": "Welcome to HostelOps API"
    }