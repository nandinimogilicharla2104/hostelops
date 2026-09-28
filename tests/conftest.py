import os
import sys
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

load_dotenv(ROOT_DIR / ".env.test")

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

if not TEST_DATABASE_URL:
    raise RuntimeError("TEST_DATABASE_URL is not configured")

if TEST_DATABASE_URL.startswith("postgresql://"):
    TEST_DATABASE_URL = TEST_DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )

test_engine = create_engine(
    TEST_DATABASE_URL,
    echo=False,
    pool_pre_ping=True
)

TestSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False
)

from app.main import app
from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.models.hostel import Hostel, HostelType
from app.models.block import Block
from app.models.room import Room
from app.models.complaint import Complaint
from app.models.complaint_category import ComplaintCategory
from app.models.technician import Technician
from app.models.technician_skill import TechnicianSkill
from app.models.notification import Notification


@pytest.fixture
def db():
    session = TestSessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def clean_test_database():
    db = TestSessionLocal()

    try:
        db.execute(text("""
            TRUNCATE TABLE
                notifications,
                complaint_history,
                complaints,
                technician_skills,
                technicians,
                room_assignments,
                rooms,
                blocks,
                complaint_categories,
                users,
                hostels
            RESTART IDENTITY CASCADE
        """))
        db.commit()

        yield

    finally:
        db.close()


@pytest.fixture
def test_data(db):
    hostel = Hostel(
        name="Test Hostel",
        location="Test Campus",
        type=HostelType.BOYS
    )
    db.add(hostel)
    db.flush()

    block = Block(
        name="Test Block",
        hostel_id=hostel.id
    )
    db.add(block)
    db.flush()

    room = Room(
        room_number="T-101",
        block_id=block.id
    )
    db.add(room)
    db.flush()

    category = ComplaintCategory(
        name="Test Plumbing",
        description="Test plumbing complaints",
        is_active=True
    )
    db.add(category)
    db.flush()

    warden = User(
        name="Test Warden",
        email="warden@test.com",
        phone="9000000001",
        password_hash="test_hash",
        role="warden",
        hostel_id=hostel.id,
        is_active=True
    )

    technician_user = User(
        name="Test Technician",
        email="technician@test.com",
        phone="9000000002",
        password_hash="test_hash",
        role="technician",
        hostel_id=hostel.id,
        is_active=True
    )

    admin = User(
        name="Test Admin",
        email="admin@test.com",
        phone="9000000003",
        password_hash="test_hash",
        role="admin",
        is_active=True
    )

    student = User(
        name="Test Student",
        email="student@test.com",
        phone="9000000004",
        password_hash="test_hash",
        role="student",
        hostel_id=hostel.id,
        is_active=True
    )

    db.add_all([
        warden,
        technician_user,
        admin,
        student
    ])
    db.flush()

    technician = Technician(
        user_id=technician_user.id,
        employee_id="TEST-TECH-001",
        availability_status="AVAILABLE",
        current_workload=0,
        hostel_id=hostel.id
    )
    db.add(technician)
    db.flush()

    skill = TechnicianSkill(
        technician_id=technician.id,
        category_id=category.id,
        skill_level=3
    )
    db.add(skill)

    complaint = Complaint(
        student_id=student.id,
        room_id=room.id,
        category_id=category.id,
        title="Test complaint",
        description="Test complaint description",
        priority="MEDIUM",
        status="SUBMITTED"
    )
    db.add(complaint)

    notification = Notification(
        user_id=technician_user.id,
        title="Test Notification",
        message="Test notification message",
        is_read=False
    )
    db.add(notification)

    db.commit()

    db.refresh(hostel)
    db.refresh(block)
    db.refresh(room)
    db.refresh(category)
    db.refresh(warden)
    db.refresh(technician_user)
    db.refresh(admin)
    db.refresh(student)
    db.refresh(technician)
    db.refresh(complaint)
    db.refresh(notification)

    return {
        "hostel": hostel,
        "block": block,
        "room": room,
        "category": category,
        "warden": warden,
        "technician_user": technician_user,
        "admin": admin,
        "student": student,
        "technician": technician,
        "complaint": complaint,
        "notification": notification
    }


@pytest.fixture
def warden(test_data):
    return test_data["warden"]


@pytest.fixture
def technician(test_data):
    return test_data["technician_user"]


@pytest.fixture
def admin(test_data):
    return test_data["admin"]


@pytest.fixture
def complaint(test_data):
    return test_data["complaint"]