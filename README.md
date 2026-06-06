# 🌸 Gopika — Soulful Style, Divine Roots

A full-stack Indian ethnic wear eCommerce platform built with **Next.js 15**, **Express.js**, and **MongoDB Atlas**.

---

## ✨ Features

- 🛍️ Product catalog with filtering, sorting & search  
- 🛒 Persistent cart (synced to DB when logged in)  
- 🔐 JWT authentication (register / login / logout)  
- 💳 Razorpay payment integration  
- 📦 Order management  
- 👑 Admin panel for product management  
- 📱 Fully responsive design  

---

## 🗂️ Project Structure

```
Gopika/
├── frontend/          # Next.js 15 (App Router)
│   ├── app/           # Pages (home, shop, cart, checkout...)
│   ├── components/    # Navbar, Footer, ProductCard
│   ├── context/       # AuthContext, CartContext
│   └── lib/           # Axios instance
│
└── backend/           # Express.js REST API
    ├── controllers/   # Business logic
    ├── models/        # Mongoose schemas
    ├── routes/        # API routes
    └── middleware/    # Auth middleware
```

---

## 🚀 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/priyachoudhary-dev/Gopika.git
cd Gopika
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Frontend
```bash
cd front
npm install
```

Create `front/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register user | — |
| POST | `/api/auth/login` | Login | — |
| GET | `/api/products` | All products (filter/sort/paginate) | — |
| GET | `/api/products/featured` | Featured products | — |
| GET | `/api/products/new-arrivals` | New arrivals | — |
| GET | `/api/cart` | Get cart | 🔐 |
| POST | `/api/cart` | Add to cart | 🔐 |
| POST | `/api/orders` | Place order | 🔐 |
| POST | `/api/payment/create-order` | Razorpay order | 🔐 |

---

## 🛍️ Product Categories

`Dress` · `Kurta` · `Saree` · `Co-Ord Set` · `Lehenga` · `Tops` · `Accessories`

---

## 🧪 Demo Credentials

After seeding the database (`node seed.js` in `/backend`):

| Role | Email | Password |
|------|-------|----------|
| Shopper | `demo@gopika.in` | `demo1234` |
| Admin | `admin@gopika.in` | `admin1234` |

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, Tailwind CSS v4 |
| Backend | Express.js 5, Node.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| Payments | Razorpay |
| Images | Cloudinary |
| Fonts | Cormorant Garamond + DM Sans |

---

## 📄 License

MIT © 2025 Gopika
