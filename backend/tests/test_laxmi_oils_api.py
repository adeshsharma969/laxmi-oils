"""
Laxmi Oils API Backend Tests
Tests for: Auth, Products, Orders, B2B Leads, Admin endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@laxmioils.com"
ADMIN_PASSWORD = "laxmi@admin2026"
DEMO_EMAIL = "demo@user.com"
DEMO_PASSWORD = "demo1234"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    assert "token" in data
    return data["token"]


@pytest.fixture(scope="module")
def customer_token(api_client):
    """Create a test customer and get token"""
    unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "testpass123",
        "name": "Test Customer",
        "phone": "9876543210"
    })
    assert response.status_code == 200, f"Customer registration failed: {response.text}"
    data = response.json()
    assert "token" in data
    return data["token"]


# ==================== API Root ====================
class TestAPIRoot:
    """Test API root endpoint"""
    
    def test_api_root(self, api_client):
        """GET /api/ returns status ok"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "Laxmi" in data["message"]
        print("✓ API root endpoint working")


# ==================== Products ====================
class TestProducts:
    """Product listing and detail endpoints"""
    
    def test_list_products_returns_6(self, api_client):
        """GET /api/products returns 6 seeded products"""
        response = api_client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"Expected 6 products, got {len(data)}"
        print(f"✓ Products list returns {len(data)} products")
    
    def test_get_single_product(self, api_client):
        """GET /api/products/{id} returns single product"""
        response = api_client.get(f"{BASE_URL}/api/products/m1l")
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == "m1l"
        assert data["name"] == "Kachi Ghani Mustard Oil"
        assert data["category"] == "mustard"
        assert "sizes" in data
        assert len(data["sizes"]) > 0
        print(f"✓ Single product m1l: {data['name']}")
    
    def test_filter_by_category_mustard(self, api_client):
        """GET /api/products?cat=mustard returns mustard-only products"""
        response = api_client.get(f"{BASE_URL}/api/products?cat=mustard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        for p in data:
            assert p["category"] == "mustard", f"Product {p['name']} is not mustard"
        print(f"✓ Mustard filter returns {len(data)} products")
    
    def test_filter_by_category_groundnut(self, api_client):
        """GET /api/products?cat=groundnut returns groundnut-only products"""
        response = api_client.get(f"{BASE_URL}/api/products?cat=groundnut")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for p in data:
            assert p["category"] == "groundnut"
        print(f"✓ Groundnut filter returns {len(data)} products")
    
    def test_product_not_found(self, api_client):
        """GET /api/products/{invalid_id} returns 404"""
        response = api_client.get(f"{BASE_URL}/api/products/nonexistent123")
        assert response.status_code == 404
        print("✓ Non-existent product returns 404")


# ==================== Auth ====================
class TestAuth:
    """Authentication endpoints"""
    
    def test_register_new_customer(self, api_client):
        """POST /api/auth/register creates a new customer"""
        unique_email = f"newuser_{uuid.uuid4().hex[:8]}@test.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "password123",
            "name": "New Test User",
            "phone": "1234567890"
        })
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email.lower()
        assert data["user"]["role"] == "customer"
        print(f"✓ Registered new customer: {unique_email}")
    
    def test_register_duplicate_email_fails(self, api_client):
        """POST /api/auth/register with existing email returns 400"""
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "email": ADMIN_EMAIL,
            "password": "somepassword",
            "name": "Duplicate User"
        })
        assert response.status_code == 400
        print("✓ Duplicate email registration rejected")
    
    def test_admin_login(self, api_client):
        """POST /api/auth/login with admin creds returns JWT with role=admin"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful, role={data['user']['role']}")
    
    def test_login_wrong_password(self, api_client):
        """POST /api/auth/login with wrong password returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Wrong password returns 401")
    
    def test_login_nonexistent_user(self, api_client):
        """POST /api/auth/login with non-existent email returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "anypassword"
        })
        assert response.status_code == 401
        print("✓ Non-existent user login returns 401")
    
    def test_get_me_with_token(self, api_client, admin_token):
        """GET /api/auth/me with Bearer token returns current user"""
        response = api_client.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"✓ /auth/me returns user: {data['email']}")
    
    def test_get_me_without_token(self, api_client):
        """GET /api/auth/me without token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /auth/me without token returns 401")


# ==================== Orders ====================
class TestOrders:
    """Order creation and retrieval"""
    
    def test_create_order_as_guest(self, api_client):
        """POST /api/orders as guest (no auth) creates an order"""
        payload = {
            "items": [{
                "product_id": "m1l",
                "name": "Kachi Ghani Mustard Oil",
                "size": "1L",
                "price": 289,
                "qty": 2
            }],
            "address": {
                "name": "Guest User",
                "email": "guest@test.com",
                "phone": "9999999999",
                "address": "123 Test Street",
                "city": "Jaipur",
                "pincode": "302001"
            },
            "delivery": "standard",
            "payment_method": "razorpay_mock"
        }
        response = api_client.post(f"{BASE_URL}/api/orders", json=payload)
        assert response.status_code == 200, f"Order creation failed: {response.text}"
        data = response.json()
        assert "order_id" in data
        assert data["order_id"].startswith("LX-")
        assert data["status"] == "paid"
        # Verify shipping: subtotal = 289*2 = 578 > 499, so standard shipping = 0
        assert data["subtotal"] == 578
        assert data["shipping"] == 0  # Free above 499
        assert data["total"] == 578
        print(f"✓ Guest order created: {data['order_id']}, total=₹{data['total']}")
    
    def test_create_order_with_standard_shipping_fee(self, api_client):
        """POST /api/orders with subtotal < 499 has ₹49 standard shipping"""
        payload = {
            "items": [{
                "product_id": "s1l",
                "name": "Refined Soyabean Oil",
                "size": "1L",
                "price": 139,
                "qty": 1
            }],
            "address": {
                "name": "Test User",
                "email": "test@test.com",
                "phone": "8888888888",
                "address": "456 Test Ave",
                "city": "Delhi",
                "pincode": "110001"
            },
            "delivery": "standard"
        }
        response = api_client.post(f"{BASE_URL}/api/orders", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["subtotal"] == 139
        assert data["shipping"] == 49  # Standard shipping for < 499
        assert data["total"] == 188
        print(f"✓ Order with standard shipping: subtotal=₹{data['subtotal']}, shipping=₹{data['shipping']}")
    
    def test_create_order_with_express_shipping(self, api_client):
        """POST /api/orders with express delivery has ₹79 shipping"""
        payload = {
            "items": [{
                "product_id": "g1l",
                "name": "Filtered Groundnut Oil",
                "size": "1L",
                "price": 249,
                "qty": 3
            }],
            "address": {
                "name": "Express User",
                "email": "express@test.com",
                "phone": "7777777777",
                "address": "789 Express Lane",
                "city": "Mumbai",
                "pincode": "400001"
            },
            "delivery": "express"
        }
        response = api_client.post(f"{BASE_URL}/api/orders", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["subtotal"] == 747
        assert data["shipping"] == 79  # Express shipping
        assert data["total"] == 826
        print(f"✓ Express order: subtotal=₹{data['subtotal']}, shipping=₹{data['shipping']}")
    
    def test_create_order_as_customer(self, api_client, customer_token):
        """POST /api/orders as authenticated customer creates order with user_id"""
        payload = {
            "items": [{
                "product_id": "m1l",
                "name": "Kachi Ghani Mustard Oil",
                "size": "500ml",
                "price": 159,
                "qty": 4
            }],
            "address": {
                "name": "Customer User",
                "email": "customer@test.com",
                "phone": "6666666666",
                "address": "Customer Street",
                "city": "Jaipur",
                "pincode": "302002"
            },
            "delivery": "standard"
        }
        response = api_client.post(
            f"{BASE_URL}/api/orders",
            json=payload,
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] is not None  # Should have user_id
        print(f"✓ Customer order created with user_id: {data['user_id'][:20]}...")
    
    def test_get_my_orders(self, api_client, customer_token):
        """GET /api/orders/me returns orders for authenticated user"""
        response = api_client.get(
            f"{BASE_URL}/api/orders/me",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /orders/me returns {len(data)} orders")
    
    def test_get_my_orders_without_auth(self, api_client):
        """GET /api/orders/me without auth returns 401"""
        response = api_client.get(f"{BASE_URL}/api/orders/me")
        assert response.status_code == 401
        print("✓ /orders/me without auth returns 401")


# ==================== B2B Leads ====================
class TestB2BLeads:
    """B2B lead creation (public endpoint)"""
    
    def test_create_b2b_lead(self, api_client):
        """POST /api/b2b/leads creates a lead (public endpoint)"""
        payload = {
            "company": "Test Restaurant",
            "name": "Test Owner",
            "email": f"b2b_{uuid.uuid4().hex[:6]}@test.com",
            "phone": "5555555555",
            "volume": "500",
            "message": "Interested in bulk mustard oil"
        }
        response = api_client.post(f"{BASE_URL}/api/b2b/leads", json=payload)
        assert response.status_code == 200, f"B2B lead creation failed: {response.text}"
        data = response.json()
        assert "lead_id" in data
        assert data["lead_id"].startswith("lead_")
        assert data["status"] == "new"
        assert data["company"] == "Test Restaurant"
        print(f"✓ B2B lead created: {data['lead_id']}")
    
    def test_create_b2b_lead_minimal(self, api_client):
        """POST /api/b2b/leads with minimal required fields"""
        payload = {
            "company": "Minimal Co",
            "name": "Min User",
            "email": f"min_{uuid.uuid4().hex[:6]}@test.com",
            "phone": "4444444444"
        }
        response = api_client.post(f"{BASE_URL}/api/b2b/leads", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["volume"] is None
        assert data["message"] is None
        print("✓ B2B lead with minimal fields created")


# ==================== Admin Endpoints ====================
class TestAdminEndpoints:
    """Admin-only endpoints"""
    
    def test_admin_stats(self, api_client, admin_token):
        """GET /api/admin/stats returns stats object"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        assert "products" in data
        assert "leads" in data
        assert "customers" in data
        assert "revenue" in data
        print(f"✓ Admin stats: orders={data['orders']}, products={data['products']}, revenue=₹{data['revenue']}")
    
    def test_admin_stats_without_auth(self, api_client):
        """GET /api/admin/stats without auth returns 401"""
        response = api_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print("✓ Admin stats without auth returns 401")
    
    def test_admin_stats_as_customer(self, api_client, customer_token):
        """GET /api/admin/stats as customer returns 403"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 403
        print("✓ Admin stats as customer returns 403")
    
    def test_admin_get_leads(self, api_client, admin_token):
        """GET /api/admin/leads returns leads list"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/leads",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin leads: {len(data)} leads")
    
    def test_admin_get_orders(self, api_client, admin_token):
        """GET /api/admin/orders returns all orders"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin orders: {len(data)} orders")
    
    def test_admin_update_order_status(self, api_client, admin_token):
        """PUT /api/admin/orders/{id}/status updates order status"""
        # First create an order
        order_payload = {
            "items": [{"product_id": "m1l", "name": "Test", "size": "1L", "price": 289, "qty": 1}],
            "address": {"name": "Status Test", "email": "status@test.com", "phone": "1111111111", "address": "Test", "city": "Test", "pincode": "111111"},
            "delivery": "standard"
        }
        create_resp = api_client.post(f"{BASE_URL}/api/orders", json=order_payload)
        order_id = create_resp.json()["order_id"]
        
        # Update status
        response = api_client.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/status",
            json={"status": "shipped"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ Order {order_id} status updated to 'shipped'")


# ==================== Admin Product CRUD ====================
class TestAdminProductCRUD:
    """Admin product management"""
    
    def test_create_product_as_admin(self, api_client, admin_token):
        """POST /api/products as admin creates a product"""
        payload = {
            "name": "Test Oil Product",
            "category": "mustard",
            "sizes": [{"label": "1L", "price": 199}],
            "description": "Test product description",
            "badge": "TEST",
            "image": "https://example.com/test.jpg",
            "bg": "#FF0000",
            "benefits": ["Test Benefit"],
            "nutrition": {"energy": "900 kcal"},
            "rating": 4.5,
            "reviews": 10
        }
        response = api_client.post(
            f"{BASE_URL}/api/products",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Product creation failed: {response.text}"
        data = response.json()
        assert "product_id" in data
        assert data["name"] == "Test Oil Product"
        print(f"✓ Admin created product: {data['product_id']}")
        return data["product_id"]
    
    def test_create_product_as_customer_fails(self, api_client, customer_token):
        """POST /api/products as customer returns 403"""
        payload = {
            "name": "Unauthorized Product",
            "category": "mustard",
            "sizes": [{"label": "1L", "price": 100}],
            "description": "Should fail",
            "image": "https://example.com/fail.jpg"
        }
        response = api_client.post(
            f"{BASE_URL}/api/products",
            json=payload,
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 403
        print("✓ Customer cannot create product (403)")
    
    def test_update_product_as_admin(self, api_client, admin_token):
        """PUT /api/products/{id} as admin updates product"""
        # First create a product
        create_payload = {
            "name": "Update Test Product",
            "category": "soyabean",
            "sizes": [{"label": "500ml", "price": 99}],
            "description": "Original description",
            "image": "https://example.com/update.jpg"
        }
        create_resp = api_client.post(
            f"{BASE_URL}/api/products",
            json=create_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        product_id = create_resp.json()["product_id"]
        
        # Update it
        update_payload = {
            "name": "Updated Product Name",
            "category": "soyabean",
            "sizes": [{"label": "500ml", "price": 149}],
            "description": "Updated description",
            "image": "https://example.com/updated.jpg"
        }
        response = api_client.put(
            f"{BASE_URL}/api/products/{product_id}",
            json=update_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Product Name"
        assert data["sizes"][0]["price"] == 149
        print(f"✓ Admin updated product: {product_id}")
    
    def test_delete_product_as_admin(self, api_client, admin_token):
        """DELETE /api/products/{id} as admin removes product"""
        # First create a product
        create_payload = {
            "name": "Delete Test Product",
            "category": "groundnut",
            "sizes": [{"label": "1L", "price": 199}],
            "description": "To be deleted",
            "image": "https://example.com/delete.jpg"
        }
        create_resp = api_client.post(
            f"{BASE_URL}/api/products",
            json=create_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        product_id = create_resp.json()["product_id"]
        
        # Delete it
        response = api_client.delete(
            f"{BASE_URL}/api/products/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        # Verify it's gone
        get_resp = api_client.get(f"{BASE_URL}/api/products/{product_id}")
        assert get_resp.status_code == 404
        print(f"✓ Admin deleted product: {product_id}")


# ==================== Google Session Endpoint ====================
class TestGoogleSession:
    """Google OAuth session endpoint exists"""
    
    def test_google_session_endpoint_exists(self, api_client):
        """POST /api/auth/google-session endpoint exists (returns 422 without valid session_id)"""
        response = api_client.post(f"{BASE_URL}/api/auth/google-session", json={"session_id": "invalid"})
        # Should return 401 (invalid session) not 404 (endpoint not found)
        assert response.status_code in [401, 422], f"Unexpected status: {response.status_code}"
        print("✓ Google session endpoint exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
