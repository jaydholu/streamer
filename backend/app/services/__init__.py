"""
Service layer — business logic for auth, profiles, and admin.
Routers call services; services call the database.
"""

from app.services import auth_service
from app.services import profile_service
from app.services import admin_service
