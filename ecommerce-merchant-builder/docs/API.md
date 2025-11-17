# API Documentation

Complete API reference for the E-Commerce Merchant Builder platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require authentication via NextAuth.js session. Include the session cookie in your requests.

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": [ ... ] // Optional, for validation errors
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "BUYER" // or "MERCHANT"
}
```

**Response:** `201 Created`
```json
{
  "id": "clxxx...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "BUYER"
}
```

---

## Store Endpoints

### Get Store

Get store details.

**Endpoint:** `GET /api/stores`

**Query Parameters:**
- `domain` (optional): Get store by domain name

**Authentication:** Required for merchant's own store

**Response:** `200 OK`
```json
{
  "id": "clxxx...",
  "name": "TechHub Electronics",
  "description": "Your one-stop shop for electronics",
  "domain": "techhub",
  "logo": "https://...",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1E40AF",
  "isActive": true,
  "_count": {
    "products": 50,
    "orders": 120
  }
}
```

### Create Store

Create a new store (Merchant only).

**Endpoint:** `POST /api/stores`

**Authentication:** Required (MERCHANT role)

**Request Body:**
```json
{
  "name": "My Store",
  "description": "Store description",
  "domain": "mystore",
  "primaryColor": "#000000",
  "secondaryColor": "#ffffff"
}
```

**Response:** `201 Created`

### Update Store

Update store settings.

**Endpoint:** `PATCH /api/stores`

**Authentication:** Required (MERCHANT role)

**Request Body:** Same as Create Store (all fields optional)

**Response:** `200 OK`

---

## Product Endpoints

### List Products

Get a list of products with search, filters, and pagination.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `search`: Search term for product name/description
- `categoryId`: Filter by category ID
- `storeId`: Filter by store ID
- `isFeatured`: Filter featured products (true/false)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "clxxx...",
      "name": "MacBook Pro 16\"",
      "slug": "macbook-pro-16",
      "description": "Powerful laptop...",
      "price": 2499.99,
      "compareAtPrice": 2799.99,
      "quantity": 15,
      "images": ["https://..."],
      "isActive": true,
      "isFeatured": true,
      "category": {
        "id": "clxxx...",
        "name": "Computers"
      },
      "store": {
        "id": "clxxx...",
        "name": "TechHub Electronics",
        "domain": "techhub"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Get Product

Get a single product by ID.

**Endpoint:** `GET /api/products/:id`

**Response:** `200 OK`
```json
{
  "id": "clxxx...",
  "name": "MacBook Pro 16\"",
  "slug": "macbook-pro-16",
  "description": "Powerful laptop with M3 Pro chip",
  "price": 2499.99,
  "compareAtPrice": 2799.99,
  "costPerItem": 2000.00,
  "sku": "MBP-16-M3",
  "quantity": 15,
  "images": ["https://..."],
  "isActive": true,
  "isFeatured": true,
  "metaTitle": "MacBook Pro 16\" - Best Laptop",
  "metaDescription": "Get the latest MacBook Pro",
  "metaKeywords": ["macbook", "laptop"],
  "category": { ... },
  "store": { ... },
  "variants": [ ... ]
}
```

### Create Product

Create a new product (Merchant only).

**Endpoint:** `POST /api/products`

**Authentication:** Required (MERCHANT role)

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "compareAtPrice": 129.99,
  "costPerItem": 50.00,
  "sku": "PROD-001",
  "barcode": "1234567890",
  "trackQuantity": true,
  "quantity": 100,
  "images": ["https://..."],
  "isActive": true,
  "isFeatured": false,
  "categoryId": "clxxx...",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description",
  "metaKeywords": ["keyword1", "keyword2"]
}
```

**Response:** `201 Created`

### Update Product

Update an existing product.

**Endpoint:** `PATCH /api/products/:id`

**Authentication:** Required (MERCHANT role, must own the product)

**Request Body:** Same as Create Product (all fields optional)

**Response:** `200 OK`

### Delete Product

Delete a product.

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (MERCHANT role, must own the product)

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully"
}
```

---

## Category Endpoints

### List Categories

Get all categories for a store.

**Endpoint:** `GET /api/categories`

**Query Parameters:**
- `storeId` (required): Store ID

**Response:** `200 OK`
```json
[
  {
    "id": "clxxx...",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices",
    "image": "https://...",
    "parent": null,
    "children": [
      {
        "id": "clxxx...",
        "name": "Computers",
        "slug": "computers"
      }
    ],
    "_count": {
      "products": 25
    }
  }
]
```

### Create Category

Create a new category.

**Endpoint:** `POST /api/categories`

**Authentication:** Required (MERCHANT role)

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description",
  "image": "https://...",
  "parentId": "clxxx..." // Optional, for subcategories
}
```

**Response:** `201 Created`

---

## Discount Endpoints

### List Discounts

Get all discounts for merchant's store.

**Endpoint:** `GET /api/discounts`

**Authentication:** Required (MERCHANT role)

**Response:** `200 OK`
```json
[
  {
    "id": "clxxx...",
    "code": "WELCOME10",
    "type": "PERCENTAGE",
    "value": 10,
    "minPurchase": 50,
    "maxUses": 100,
    "usedCount": 25,
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "isActive": true
  }
]
```

### Create Discount

Create a new discount code.

**Endpoint:** `POST /api/discounts`

**Authentication:** Required (MERCHANT role)

**Request Body:**
```json
{
  "code": "SUMMER20",
  "type": "PERCENTAGE", // or "FIXED_AMOUNT"
  "value": 20,
  "minPurchase": 100,
  "maxUses": 50,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "isActive": true
}
```

**Response:** `201 Created`

---

## Order Endpoints

### List Orders

Get orders (filtered by user role).

**Endpoint:** `GET /api/orders`

**Authentication:** Required

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `status`: Filter by order status

**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": "clxxx...",
      "orderNumber": "ORD-12345",
      "status": "PAID",
      "subtotal": 1249.98,
      "discount": 0,
      "tax": 0,
      "shipping": 0,
      "total": 1249.98,
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "items": [
        {
          "id": "clxxx...",
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "quantity": 1,
          "total": 999.99,
          "product": { ... }
        }
      ],
      "store": { ... },
      "user": { ... },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Create Order

Create a new order.

**Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "storeId": "clxxx...",
  "items": [
    {
      "productId": "clxxx...",
      "variantId": "clxxx...", // Optional
      "quantity": 1
    }
  ],
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "discountCode": "WELCOME10" // Optional
}
```

**Response:** `201 Created`

---

## Checkout Endpoints

### Create Checkout Session

Create a Stripe checkout session.

**Endpoint:** `POST /api/checkout`

**Request Body:**
```json
{
  "orderId": "clxxx..."
}
```

**Response:** `200 OK`
```json
{
  "sessionId": "cs_test_xxx...",
  "url": "https://checkout.stripe.com/..."
}
```

---

## Upload Endpoints

### Upload Image

Upload an image to S3/R2.

**Endpoint:** `POST /api/upload`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Image file (JPEG, PNG, WebP, GIF, max 5MB)

**Response:** `200 OK`
```json
{
  "url": "https://pub-xxxxx.r2.dev/uploads/1234567890-image.jpg"
}
```

---

## Admin Endpoints

### Get Platform Statistics

Get platform-wide statistics.

**Endpoint:** `GET /api/admin/stats`

**Authentication:** Required (ADMIN role)

**Response:** `200 OK`
```json
{
  "stats": {
    "totalMerchants": 150,
    "totalBuyers": 5000,
    "totalStores": 148,
    "totalProducts": 12500,
    "totalOrders": 8500,
    "totalRevenue": 450000.00
  },
  "recentOrders": [ ... ],
  "topStores": [
    {
      "id": "clxxx...",
      "name": "TechHub Electronics",
      "domain": "techhub",
      "ordersCount": 500,
      "productsCount": 150,
      "revenue": 125000.00
    }
  ]
}
```

---

## Webhook Endpoints

### Stripe Webhook

Handle Stripe webhook events.

**Endpoint:** `POST /api/webhooks/stripe`

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Events Handled:**
- `checkout.session.completed`: Updates order status to PAID
- `payment_intent.succeeded`: Logs successful payment
- `payment_intent.payment_failed`: Logs failed payment

**Response:** `200 OK`
```json
{
  "received": true
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## CORS

CORS is configured to allow requests from the same origin. Update for production deployment.

---

For more information, see the main [README.md](../README.md).
