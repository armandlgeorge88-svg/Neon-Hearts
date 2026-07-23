from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends, Header, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ----- config -----
MONGO_URL = os.environ DB_NAME = os.environ JWT_SECRET = os.environ JWT_ALGO = "HS256"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "pebblesphere")

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

client = AsyncIOMotorClient(MONGO_URL)
db = client app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pebblesphere")

# ----- helpers -----
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_token(user_id: str, kind: str = "access") -> str:
    exp = datetime.now(timezone.utc) + (timedelta(minutes=60*24*7) if kind == "access" else timedelta(days=30))
    return jwt.encode({"sub": user_id, "type": kind, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGO)

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms= )

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload })
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def set_auth_cookies(response: Response, user_id: str):
    access = create_token(user_id, "access")
    refresh = create_token(user_id, "refresh")
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=60*60*24*7, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=60*60*24*30, path="/")
    return access

# ----- storage -----
storage_key = None
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    r.raise_for_status()
    storage_key = r.json() return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    k = init_storage()
    r = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": k, "Content-Type": content_type}, data=data, timeout=120)
    r.raise_for_status()
    return r.json()

def get_object(path: str):
    k = init_storage()
    r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": k}, timeout=60)
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

# ----- models -----
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional = None
    age: Optional = Field(default=None, ge=18, le=100)
    height_cm: Optional = Field(default=None, ge=60, le=180)
    gender: Optional = None
    looking_for: Optional = None
    city: Optional = None
    bio: Optional = None
    interests: Optional = None
    photos: Optional = None
    verified: Optional = None

class SwipeIn(BaseModel):
    target_id: str
    action: str

class MessageIn(BaseModel):
    match_id: str
    text: str = Field(min_length=1, max_length=2000)

def serialize_user(u: dict) -> dict:
    u.pop("_id", None)
    u.pop("password_hash", None)
    return u

# ----- routes -----
@api.get("/")
async def root():
    return {"app": "Pebble Sphere", "status": "ok"}

@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    uid = str(uuid.uuid4())
    user = {
        "id": uid,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "age": None,
        "height_cm": None,
        "gender": None,
        "looking_for": [ ],
        "photos": [],
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = set_auth_cookies(response, uid)
    return {"user": serialize_user(dict(user)), "token": token}

@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user ):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = set_auth_cookies(response, user )
    return {"user": serialize_user(dict(user)), "token": token}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api.get("/profile/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    return user

@api.put("/profile/me")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates
