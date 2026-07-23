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
    updates    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if updates:
        await db.users.update_one({"id": user }, {"$set": updates})
    fresh = await db.users.find_one({"id": user })
    return serialize_user(dict(fresh))

@api.post("/upload/photo")
async def upload_photo(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")
    ext = (file.filename or "img").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        ext = "jpg"
    path = f"{APP_NAME}/photos/{user }/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")
    try:
        result = put_object(path, data, file.content_type)
    except Exception as e:
        logger.error(f"upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "owner_id": user ,
        "storage_path": result ,
        "content_type": file.content_type,
        "size": result.get("size"),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": result }

@api.get("/files/{path:path}")
async def download_file(path: str):
    rec = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        data, ct = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
    return Response(content=data, media_type=rec.get("content_type", ct))

def _match_id(a: str, b: str) -> str:
    return "|".join(sorted( ))

@api.get("/discover")
async def discover(user: dict = Depends(get_current_user), limit: int = 10):
    swiped = await db.swipes.find({"actor_id": user }, {"target_id": 1, "_id": 0}).to_list(1000)
    excluded_ids = {s for s in swiped}
    excluded_ids.add(user )
    query = {"id": {"$nin": list(excluded_ids)}, "age": {"$ne": None}}
    looking_for = user.get("looking_for") or []
    if looking_for:
        query = {"$in": looking_for}
    cursor = db.users.find(query).limit(limit)
    results = []
    async for u in cursor:
        results.append(serialize_user(dict(u)))
    return results

@api.post("/swipe")
async def swipe(payload: SwipeIn, user: dict = Depends(get_current_user)):
    if payload.target_id == user :
        raise HTTPException(status_code=400, detail="Cannot swipe yourself")
    if payload.action not in {"like", "pass"}:
        raise HTTPException(status_code=400, detail="Invalid action")
    target = await db.users.find_one({"id": payload.target_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    await db.swipes.update_one(
        {"actor_id": user , "target_id": payload.target_id},
        {"$set": {"action": payload.action, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    matched = False
    match_doc = None
    if payload.action == "like":
        rec = await db.swipes.find_one({"actor_id": payload.target_id, "target_id": user["id"], "action": "like"})
        if rec:
            mid = _match_id(user , payload.target_id)
            existing = await db.matches.find_one({"id": mid})
            if not existing:
                match_doc = {
                    "id": mid,
                    "user_ids": sorted( , payload.target_id]),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "last_message_at": None,
                }
                await db.matches.insert_one(match_doc)
            else:
                match_doc = existing
                match_doc.pop("_id", None)
            matched = True
    return {"matched": matched, "match": match_doc}

@api.get("/matches")
async def list_matches(user: dict = Depends(get_current_user)):
    cursor = db.matches.find({"user_ids": user }).sort("created_at", -1)
    out = []
    async for m in cursor:
        m.pop("_id", None)
        other_id = next((x for x in m if x != user ), None)
        other = await db.users.find_one({"id": other_id}) if other_id else None
        if other:
            m = serialize_user(dict(other))
            out.append(m)
    return out

@api.get("/matches/{match_id}/messages")
async def get_messages(match_id: str, user: dict = Depends(get_current_user)):
    match = await db.matches.find_one({"id": match_id})
    if not match or user not in match :
        raise HTTPException(status_code=404, detail="Match not found")
    cursor = db.messages.find({"match_id": match_id}).sort("created_at", 1)
    msgs = []
    async for m in cursor:
        m.pop("_id", None)
        msgs.append(m)
    return msgs

@api.post("/messages")
async def send_message(payload: MessageIn, user: dict = Depends(get_current_user)):
    match = await db.matches.find_one({"id": payload.match_id})
    if not match or user not in match["user_ids"]:
        raise HTTPException(status_code=404, detail="Match not found")
    msg = {
        "id": str(uuid.uuid4()),
        "match_id": payload.match_id,
        "sender_id": user["id"],
        "text": payload.text.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(msg)
    await db.matches.update_one({"id": payload.match_id}, {"$set": {"last_message_at": msg }})
    msg.pop("_id", None)
    return msg

# ----- startup -----
@app.on_event("startup")
async def startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.swipes.create_index([("actor_id", 1), ("target_id", 1)], unique=True)
        await db.matches.create_index("id", unique=True)
        await db.messages.create_index([("match_id", 1), ("created_at", 1)])
    except Exception as e:
        logger.warning(f"index create warn: {e}")
    try:
        init    try:
        init_storage()
        logger.info("storage ready")
    except Exception as e:
        logger.warning(f"storage init failed (uploads may fail): {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*" "*"],
)
