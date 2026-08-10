from fastapi import FastAPI

app = FastAPI(
    title="HostelOps API",
    description="Hostel Maintenance & Complaint Management Platform",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to HostelOps API"
    }