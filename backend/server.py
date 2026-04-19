from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import bcrypt
import jwt
import httpx
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, status
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------- DB ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
JWT_EXPIRE_DAYS = 7

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("laxmi")

app = FastAPI(title="Laxmi Oils API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend calls via REACT_APP_BACKEND_URL; credentials only via Authorization header
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Utilities ----------------
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try: return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception: return False

def make_jwt(user_id: str, role: str) -> str:
    payload = {"sub": user_id, "role": role, "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def current_user(request: Request, required: bool = True):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    # fallback: session_token cookie (google)
    session_token = request.cookies.get("session_token")
    if token:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
            user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
            if user: return user
        except jwt.PyJWTError: pass
    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            exp = sess.get("expires_at")
            if isinstance(exp, str): exp = datetime.fromisoformat(exp)
            if exp and exp.tzinfo is None: exp = exp.replace(tzinfo=timezone.utc)
            if exp and exp > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
                if user: return user
    if required:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return None

async def require_admin(request: Request):
    user = await current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

# ---------------- Models ----------------
class RegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    phone: Optional[str] = None
    ref: Optional[str] = None

class LoginReq(BaseModel):
    email: EmailStr
    password: str

class AddressModel(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    city: str
    pincode: str

class OrderItem(BaseModel):
    product_id: str
    name: str
    size: str
    price: float
    qty: int
    image: Optional[str] = None
    bg: Optional[str] = None

class OrderCreateReq(BaseModel):
    items: List[OrderItem]
    address: AddressModel
    delivery: Literal["standard", "express"] = "standard"
    payment_method: str = "razorpay_mock"
    coupon_code: Optional[str] = None
    use_credit: bool = False
    credit_amount: float = 0

class CouponValidateReq(BaseModel):
    code: str
    email: Optional[str] = None

class B2BLeadReq(BaseModel):
    company: str
    name: str
    email: EmailStr
    phone: str
    volume: Optional[str] = None
    message: Optional[str] = None

class ProductSize(BaseModel):
    label: str
    price: float

class ProductIn(BaseModel):
    name: str
    category: Literal["mustard", "soyabean", "groundnut"]
    sizes: List[ProductSize]
    description: str
    badge: str = "NEW"
    image: str
    bg: str = "#D98F00"
    benefits: List[str] = []
    nutrition: dict = {}
    rating: float = 4.8
    reviews: int = 0

# ---------------- Auth ----------------
def make_referral_code(name: str) -> str:
    prefix = "".join(c for c in (name or "LAX").upper() if c.isalpha())[:3] or "LAX"
    return f"{prefix}{uuid.uuid4().hex[:5].upper()}"

@api.post("/auth/register")
async def register(req: RegisterReq):
    email = req.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    # unique referral code
    for _ in range(5):
        code = make_referral_code(req.name)
        if not await db.users.find_one({"referral_code": code}): break
    referred_by = None
    if req.ref:
        referrer = await db.users.find_one({"referral_code": req.ref.upper().strip()})
        if referrer: referred_by = referrer["user_id"]
    user = {"user_id": user_id, "email": email, "password_hash": hash_pw(req.password),
            "name": req.name, "phone": req.phone, "role": "customer",
            "provider": "password", "referral_code": code, "referred_by": referred_by,
            "rewards_earned": 0, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.users.insert_one(user)
    token = make_jwt(user_id, "customer")
    return {"token": token, "user": {"user_id": user_id, "email": email, "name": req.name, "phone": req.phone, "role": "customer", "referral_code": code}}

@api.post("/auth/login")
async def login(req: LoginReq):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_pw(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = make_jwt(user["user_id"], user.get("role", "customer"))
    return {"token": token, "user": {"user_id": user["user_id"], "email": user["email"], "name": user.get("name"), "phone": user.get("phone"), "role": user.get("role", "customer")}}

@api.get("/auth/me")
async def me(request: Request):
    user = await current_user(request)
    return {"user_id": user["user_id"], "email": user["email"], "name": user.get("name"), "phone": user.get("phone"), "role": user.get("role","customer"), "picture": user.get("picture"), "referral_code": user.get("referral_code"), "rewards_earned": user.get("rewards_earned", 0)}


@api.post("/auth/logout")
async def logout(request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    return {"ok": True}

# ---------------- Products ----------------
@api.get("/products")
async def list_products(cat: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if cat and cat != "all": query["category"] = cat
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [{"name": regex}, {"description": regex}, {"category": regex}, {"badge": regex}]
    items = await db.products.find(query, {"_id": 0}).to_list(200)
    return items

@api.get("/products/{product_id}")
async def get_product(product_id: str):
    p = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not p: raise HTTPException(404, "Not found")
    return p

@api.post("/products")
async def create_product(p: ProductIn, _admin = Depends(require_admin)):
    doc = p.model_dump()
    doc["product_id"] = f"prod_{uuid.uuid4().hex[:10]}"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.put("/products/{product_id}")
async def update_product(product_id: str, p: ProductIn, _admin = Depends(require_admin)):
    res = await db.products.update_one({"product_id": product_id}, {"$set": p.model_dump()})
    if res.matched_count == 0: raise HTTPException(404, "Not found")
    updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    return updated

@api.delete("/products/{product_id}")
async def delete_product(product_id: str, _admin = Depends(require_admin)):
    res = await db.products.delete_one({"product_id": product_id})
    if res.deleted_count == 0: raise HTTPException(404, "Not found")
    return {"ok": True}

# ---------------- Coupons / Referrals ----------------
async def resolve_coupon(code: str, email: Optional[str]) -> dict:
    code = (code or "").upper().strip()
    if not code: return {"valid": False, "discount": 0, "reason": "Empty code"}
    if code == "LAXMI100":
        # first-order coupon: only if this email has no prior orders
        if email:
            prev = await db.orders.count_documents({"email": email.lower().strip()})
            if prev > 0: return {"valid": False, "discount": 0, "reason": "LAXMI100 is only valid on your first order"}
        return {"valid": True, "discount": 100, "kind": "first_order", "code": code}
    # referral code of another user
    referrer = await db.users.find_one({"referral_code": code}, {"_id": 0})
    if referrer:
        if email and referrer.get("email") == email.lower().strip():
            return {"valid": False, "discount": 0, "reason": "You can't use your own referral code"}
        return {"valid": True, "discount": 100, "kind": "referral", "code": code, "referrer_id": referrer["user_id"]}
    return {"valid": False, "discount": 0, "reason": "Invalid code"}

@api.post("/coupons/validate")
async def validate_coupon(req: CouponValidateReq):
    return await resolve_coupon(req.code, req.email)

@api.get("/referrals/me")
async def my_referrals(request: Request):
    user = await current_user(request)
    signups = await db.users.count_documents({"referred_by": user["user_id"]})
    redeemed = await db.orders.count_documents({"coupon_kind": "referral", "coupon_referrer_id": user["user_id"]})
    return {"referral_code": user.get("referral_code"), "signups": signups, "orders_redeemed": redeemed, "rewards_earned": user.get("rewards_earned", 0), "share_message": f"Try Laxmi's wood-pressed oils — use my code {user.get('referral_code')} for ₹100 off your first order."}

# ---------------- Orders ----------------
@api.post("/orders")
async def create_order(req: OrderCreateReq, request: Request):
    user = await current_user(request, required=False)
    subtotal = sum(i.price * i.qty for i in req.items)
    shipping = 79 if req.delivery == "express" else (0 if subtotal > 499 else 49)
    discount = 0
    coupon_info = {}
    if req.coupon_code:
        c = await resolve_coupon(req.coupon_code, req.address.email)
        if c.get("valid"):
            discount = min(c["discount"], subtotal)
            coupon_info = {"coupon_code": c["code"], "coupon_kind": c.get("kind"), "coupon_referrer_id": c.get("referrer_id")}
    total = max(0, subtotal + shipping - discount)
    # Store credit
    credit_used = 0
    if req.use_credit and user:
        balance = int(user.get("rewards_earned", 0) or 0)
        want = int(req.credit_amount or balance)
        credit_used = max(0, min(balance, want, total))
        total = total - credit_used
    order_id = f"LX-{uuid.uuid4().hex[:8].upper()}"
    doc = {"order_id": order_id, "user_id": user["user_id"] if user else None,
           "email": req.address.email.lower().strip(), "address": req.address.model_dump(),
           "items": [i.model_dump() for i in req.items],
           "subtotal": subtotal, "shipping": shipping, "discount": discount, "credit_used": credit_used, "total": total,
           "delivery": req.delivery, "payment_method": req.payment_method,
           "status": "paid", "created_at": datetime.now(timezone.utc).isoformat(),
           **coupon_info}
    await db.orders.insert_one(doc)
    # Deduct used store credit from user
    if credit_used > 0 and user:
        await db.users.update_one({"user_id": user["user_id"]}, {"$inc": {"rewards_earned": -credit_used}})
    # Credit referrer if referral code used
    if coupon_info.get("coupon_kind") == "referral" and coupon_info.get("coupon_referrer_id"):
        await db.users.update_one({"user_id": coupon_info["coupon_referrer_id"]}, {"$inc": {"rewards_earned": 100}})
    doc.pop("_id", None)
    return doc

@api.get("/orders/me")
async def my_orders(request: Request):
    user = await current_user(request)
    orders = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await current_user(request, required=False)
    o = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not o: raise HTTPException(404, "Not found")
    if user and (user.get("role") == "admin" or o.get("user_id") == user["user_id"]):
        return o
    # allow guest with email match
    if user is None or o.get("email") == (user.get("email") if user else None):
        return o
    raise HTTPException(403, "Forbidden")

@api.get("/admin/orders")
async def admin_orders(_admin = Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, body: dict, _admin = Depends(require_admin)):
    new_status = body.get("status")
    if new_status not in ("paid","packed","shipped","delivered","cancelled"):
        raise HTTPException(400, "Invalid status")
    res = await db.orders.update_one({"order_id": order_id}, {"$set": {"status": new_status}})
    if res.matched_count == 0: raise HTTPException(404, "Not found")
    return {"ok": True}

# ---------------- B2B Leads ----------------
@api.post("/b2b/leads")
async def create_lead(req: B2BLeadReq):
    lead_id = f"lead_{uuid.uuid4().hex[:10]}"
    doc = {"lead_id": lead_id, **req.model_dump(), "status":"new", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.b2b_leads.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.get("/admin/leads")
async def list_leads(_admin = Depends(require_admin)):
    leads = await db.b2b_leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return leads

@api.put("/admin/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, body: dict, _admin = Depends(require_admin)):
    res = await db.b2b_leads.update_one({"lead_id": lead_id}, {"$set": {"status": body.get("status","new")}})
    if res.matched_count == 0: raise HTTPException(404, "Not found")
    return {"ok": True}

# ---------------- Admin CSV + Invoice ----------------
class ProductBulkImport(BaseModel):
    products: List[ProductIn]

@api.post("/admin/products/import")
async def bulk_import_products(req: ProductBulkImport, _admin = Depends(require_admin)):
    created = []
    now = datetime.now(timezone.utc).isoformat()
    for p in req.products:
        doc = p.model_dump()
        doc["product_id"] = f"prod_{uuid.uuid4().hex[:10]}"
        doc["created_at"] = now
        await db.products.insert_one(doc)
        created.append(doc["product_id"])
    return {"created": len(created), "product_ids": created}

@api.get("/admin/orders.csv")
async def orders_csv(_admin = Depends(require_admin)):
    from fastapi.responses import PlainTextResponse
    import csv, io
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["order_id","created_at","status","customer_name","email","phone","city","pincode","items","subtotal","shipping","discount","credit_used","total","delivery","payment_method","coupon_code"])
    for o in orders:
        addr = o.get("address", {})
        items_str = " | ".join(f"{i.get('name')} ({i.get('size')}) x{i.get('qty')}" for i in o.get("items", []))
        w.writerow([o.get("order_id"), o.get("created_at"), o.get("status"), addr.get("name"), o.get("email"), addr.get("phone"), addr.get("city"), addr.get("pincode"), items_str, o.get("subtotal"), o.get("shipping"), o.get("discount", 0), o.get("credit_used", 0), o.get("total"), o.get("delivery"), o.get("payment_method"), o.get("coupon_code","")])
    return PlainTextResponse(buf.getvalue(), headers={"Content-Disposition": "attachment; filename=laxmi-orders.csv"}, media_type="text/csv")

# ---------------- Admin stats ----------------
@api.get("/admin/stats")
async def stats(_admin = Depends(require_admin)):
    orders = await db.orders.count_documents({})
    products = await db.products.count_documents({})
    leads = await db.b2b_leads.count_documents({})
    users = await db.users.count_documents({"role":"customer"})
    revenue_agg = await db.orders.aggregate([{"$group": {"_id": None, "total": {"$sum": "$total"}}}]).to_list(1)
    revenue = revenue_agg[0]["total"] if revenue_agg else 0
    return {"orders": orders, "products": products, "leads": leads, "customers": users, "revenue": revenue}

# ---------------- Seed ----------------
SEED_PRODUCTS = [
    {"product_id":"m1l","name":"Kachi Ghani Mustard Oil","category":"mustard","sizes":[{"label":"500ml","price":159},{"label":"1L","price":289},{"label":"5L","price":1399}],"rating":4.9,"reviews":2184,"badge":"BESTSELLER","image":"https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900","description":"Wood cold-pressed from hand-picked Rajasthani mustard seeds. Pungent, sharp, fiery — the way Dadi used to cook.","benefits":["Cold Pressed","Unrefined","High in Omega-3","No Additives"],"nutrition":{"energy":"900 kcal","fat":"100g","sat":"9g","trans":"0g"},"bg":"#D98F00"},
    {"product_id":"g1l","name":"Filtered Groundnut Oil","category":"groundnut","sizes":[{"label":"1L","price":249},{"label":"5L","price":1199},{"label":"15L","price":3499}],"rating":4.8,"reviews":1542,"badge":"PURE","image":"https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900","description":"Kolhu-filtered single origin Saurashtra groundnuts. Deep nutty aroma, perfect for deep frying.","benefits":["Single Origin","High Smoke Point","Rich in Vit E","Zero Cholesterol"],"nutrition":{"energy":"884 kcal","fat":"100g","sat":"17g","trans":"0g"},"bg":"#B8431A"},
    {"product_id":"s1l","name":"Refined Soyabean Oil","category":"soyabean","sizes":[{"label":"1L","price":139},{"label":"5L","price":649}],"rating":4.7,"reviews":987,"badge":"LIGHT","image":"https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900","description":"Six-stage refined MP soyabean oil. Light, neutral and heart-friendly — your everyday warrior.","benefits":["6x Refined","Heart Light","Vit A+D Fortified","Neutral Flavour"],"nutrition":{"energy":"884 kcal","fat":"100g","sat":"16g","trans":"0g"},"bg":"#2B2A28"},
    {"product_id":"m5l","name":"Mustard Oil Family Jar","category":"mustard","sizes":[{"label":"5L","price":1399},{"label":"15L","price":4049}],"rating":4.9,"reviews":812,"badge":"FAMILY","image":"https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900","description":"The monthly ration your family deserves. Vacuum-sealed tins keep it fresh for 9 months.","benefits":["Bulk Value","Sealed Freshness","Kachi Ghani","Handmade"],"nutrition":{"energy":"900 kcal","fat":"100g","sat":"9g","trans":"0g"},"bg":"#D98F00"},
    {"product_id":"g5l","name":"Groundnut Oil Tin","category":"groundnut","sizes":[{"label":"5L","price":1199},{"label":"15L","price":3499}],"rating":4.8,"reviews":621,"badge":"TIN","image":"https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900","description":"The authentic tin pack — built for the halwai, loved by the home cook.","benefits":["Traditional Tin","Cold Filtered","Bulk Value","Kolhu Pressed"],"nutrition":{"energy":"884 kcal","fat":"100g","sat":"17g","trans":"0g"},"bg":"#B8431A"},
    {"product_id":"s5l","name":"Soyabean Family Pack","category":"soyabean","sizes":[{"label":"5L","price":649},{"label":"15L","price":1899}],"rating":4.6,"reviews":445,"badge":"VALUE","image":"https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900","description":"Light on the stomach, heavy on value. 15L of everyday goodness.","benefits":["Family Size","Vit A+D","Refined","Affordable"],"nutrition":{"energy":"884 kcal","fat":"100g","sat":"16g","trans":"0g"},"bg":"#2B2A28"},
]

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.users.create_index("referral_code", sparse=True)
    await db.products.create_index("product_id", unique=True)
    await db.orders.create_index("order_id", unique=True)
    await db.b2b_leads.create_index("lead_id", unique=True)
    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@laxmioils.com").lower()
    admin_pw = os.environ.get("ADMIN_PASSWORD", "laxmi@admin2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}", "email": admin_email,
            "password_hash": hash_pw(admin_pw), "name":"Laxmi Admin", "role":"admin",
            "provider":"password", "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Seeded admin: {admin_email}")
    else:
        if not verify_pw(admin_pw, existing.get("password_hash","")):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_pw(admin_pw), "role":"admin"}})
    # seed products
    count = await db.products.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc).isoformat()
        for p in SEED_PRODUCTS:
            await db.products.insert_one({**p, "created_at": now})
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")
    # Backfill referral codes for any user missing one
    async for u in db.users.find({"referral_code": {"$exists": False}}, {"_id": 0, "user_id": 1, "name": 1}):
        for _ in range(5):
            code = make_referral_code(u.get("name","LAX"))
            if not await db.users.find_one({"referral_code": code}): break
        await db.users.update_one({"user_id": u["user_id"]}, {"$set": {"referral_code": code, "rewards_earned": 0}})

@app.on_event("shutdown")
async def on_shutdown():
    client.close()

@api.get("/")
async def root():
    return {"message": "Laxmi Oils API", "status": "ok"}

app.include_router(api)
