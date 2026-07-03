# RAIR Reborn

A full rebuild of the [RAIR Clothing](https://github.com/AymerickTilly/Cloud-Computing) platform, originally a university cloud computing assignment built on AWS, now rewritten from scratch in C# and ASP.NET Core to explore a new stack.

---

## Context

The original assignment brief was to design and deploy a full-stack e-commerce platform on AWS. The original RAIR used:

- **AWS Lambda** (Node.js) for backend logic
- **DynamoDB** for data storage
- **AWS Cognito + Amplify** for authentication
- **S3 + CloudFront** for frontend hosting and image storage
- **AWS CodePipeline** for CI/CD

This version keeps the same concept (a clothing store), but rebuilds every layer. The motivation was not to fix something broken (the AWS version worked), but to discover C#, .NET, and a different set of services while producing something more maintainable and portable.

---

## What Changed

| Layer | Original (AWS) | Reborn |
|---|---|---|
| Frontend hosting | S3 + CloudFront | Vercel |
| Authentication | AWS Cognito + Amplify | Supabase Auth |
| OAuth | Not implemented | Google + GitHub via Supabase |
| Backend runtime | AWS Lambda (Node.js) | ASP.NET Core Web API (.NET 10) |
| Backend hosting | Lambda (serverless) | Render (Docker container) |
| Database | DynamoDB (NoSQL) | PostgreSQL via Supabase |
| ORM | None (raw DynamoDB SDK) | Entity Framework Core |
| Image storage | S3 | Cloudinary |
| CI/CD | AWS CodePipeline | Vercel (frontend) + Render (backend) |
| Repo structure | Frontend only | Monorepo (frontend + backend) |

---

## Stack

### Frontend: `rair-frontend/`

| Tool | Role |
|---|---|
| React 19 + Vite | Framework and build tool |
| TypeScript | Type safety throughout |
| React Router v7 | Client-side routing |
| React Hook Form + Zod | Form state and validation |
| Zustand | Global auth state and toast store |
| Supabase JS client | Auth (sign in, OAuth, password reset) |
| Custom CSS + OKLCH tokens | Design system (no CSS framework) |
| Barlow Condensed + Jost | Display and body fonts |
| Bootstrap 5 | Modal only (quick-view, add-to-cart) |
| Cloudinary | Image URLs served via CDN |

### Backend: `RairCore/`

| Tool | Role |
|---|---|
| ASP.NET Core (.NET 10) | REST API framework |
| Entity Framework Core | ORM: C# models mapped to PostgreSQL tables |
| Supabase PostgreSQL | Relational database |
| Supabase Auth | JWT issuance (ES256) |
| JWT Middleware | `[Authorize]` validates Supabase tokens |
| Cloudinary .NET SDK | Image upload and deletion |
| Docker | Container for Render deployment |

### Infrastructure

| Service | What it hosts |
|---|---|
| Vercel | React frontend, auto-deploys on push to `main` |
| Render | ASP.NET Core API, Docker container, free tier |
| Supabase | PostgreSQL database + Auth provider |
| Cloudinary | Product images, Dynamic Folder Mode |
| GitHub | Source control + OAuth provider |
| Google Cloud | OAuth provider |

---

## Architecture

```
User Browser
     │
     ▼
┌──────────────┐
│    Vercel    │  React 19 + Vite + TypeScript
└──────┬───────┘
       │  HTTPS REST (Authorization: Bearer <JWT>)
       ▼
┌──────────────┐
│    Render    │  ASP.NET Core Web API (.NET 10)
│   (Docker)   │  Controllers → EF Core → PostgreSQL
└──────┬───────┘
       │
  ┌────┴────────┐
  │             │
  ▼             ▼
Supabase    Cloudinary
PostgreSQL   Product images
+ Auth
```

Auth flow: Supabase issues a JWT on sign-in → stored in Zustand → attached as `Bearer` header on every API call → .NET middleware validates the token signature using Supabase's ES256 public key.

---

## Database Schema

```
Products (ProductId text PK, Name, Description, Category, ImageUrl, Price)
    │
    └── StockItems (Id serial PK, ProductId FK, Size, StockAmount)

Orders (Id serial PK, UserId, Date, Status, TotalPrice)
    │
    └── OrderProducts (Id serial PK, OrderId FK, ProductId FK, Quantity, UnitPrice)

Users (UserId text PK, Username, Address)
```

---

## API Endpoints

All routes require a valid Supabase JWT via `Authorization: Bearer <token>`.

| Method | Endpoint | Action |
|---|---|---|
| GET | `/products` | List all products with stock |
| GET | `/product?productId=` | Get one product |
| POST | `/product` | Create product |
| PUT | `/product` | Update product + restock |
| DELETE | `/product?productId=` | Delete product |
| GET | `/users` | List all users |
| GET | `/user?userId=` | Get one user |
| POST | `/user` | Create user profile |
| PUT | `/user` | Update user profile |
| GET | `/orders` | List all orders |
| GET | `/order?orderId=` | Get one order |
| POST | `/order` | Place order (decrements stock) |
| PUT | `/order` | Update order status |
| DELETE | `/order?orderId=` | Cancel order (restores stock) |
| GET | `/cart?userId=` | Get user's cart |
| POST | `/cart` | Add item to cart |
| PUT | `/cart` | Update cart item quantity |
| DELETE | `/cart?userId=&cartId=` | Remove cart item |
| POST | `/image` | Upload image to Cloudinary |
| DELETE | `/image?imageUrl=` | Delete image from Cloudinary |

---

## Key Design Decisions

**Supabase instead of Cognito:** Cognito JWTs are AWS-specific and require the Amplify SDK. Supabase issues standard ES256 JWTs that any JWT library can validate, including .NET's built-in middleware. No vendor SDK required on the backend.

**Render instead of Lambda:** Lambda enforced a one-function-per-endpoint model with no shared types, no ORM, and no structured error handling. A single ASP.NET Core container on Render runs all endpoints in one process with full access to EF Core, dependency injection, and C# type safety. Cold starts are handled by Render's keep-alive.

**PostgreSQL instead of DynamoDB:** Orders containing products with sizes and quantities are inherently relational. DynamoDB required denormalizing everything into flat documents. PostgreSQL enforces relationships with foreign keys and lets EF Core generate all SQL.

**Cloudinary instead of S3:** S3 requires IAM roles, presigned URLs, and bucket policies. Cloudinary accepts a base64 upload and returns a public CDN URL. `f_auto` and `q_auto` handle format conversion and compression automatically.

**OKLCH design tokens:** The entire color system is defined in OKLCH (`--rair-bg`, `--rair-primary`, `--rair-muted`, `--rair-border`, `--rair-ink`). OKLCH provides perceptually uniform lightness, making it easier to build accessible contrast ratios without guessing.

---

## Order Lifecycle

```
PROCESSING → SHIPPED → DELIVERED
     │
     └── CANCELLED (from PROCESSING only, by customer or admin)
```

Cancelling an order restores stock for each line item. Admin can update status from any state; customers can only cancel while PROCESSING.

---

## Project Structure

```
rair-reborn/
├── RairCore/                          # ASP.NET Core Web API
│   ├── Controllers/
│   │   ├── ProductsController.cs      # /products + /product
│   │   ├── UsersController.cs         # /users + /user
│   │   ├── CartController.cs          # /cart
│   │   ├── OrdersController.cs        # /orders + /order
│   │   └── ImagesController.cs        # /image
│   ├── Models/
│   │   ├── Product.cs + StockItem.cs
│   │   ├── User.cs
│   │   ├── Cart.cs + CartItem.cs
│   │   └── Order.cs + OrderProduct.cs
│   ├── Data/
│   │   └── AppDbContext.cs            # EF Core context
│   ├── Migrations/                    # Auto-generated migration files
│   ├── Dockerfile                     # Container for Render
│   └── Program.cs                     # Entry point + middleware pipeline
└── rair-frontend/                     # React frontend
    ├── src/
    │   ├── pages/                     # Route-level components
    │   ├── components/                # Shared UI components
    │   ├── api/                       # Fetch wrappers for each endpoint
    │   ├── auth/                      # Supabase auth helpers + Zustand store
    │   ├── schemas/                   # Zod validation schemas
    │   ├── types/                     # TypeScript interfaces
    │   └── styles/tokens.css          # OKLCH design tokens
    └── public/favicon.svg             # RAIR lettermark
```

---

## Local Development

**Backend:**
```bash
cd RairCore

# Create appsettings.json with your credentials (never commit this file)
# Required keys: ConnectionStrings:DefaultConnection, Supabase:Url,
# Supabase:Key, Supabase:JwtSecret, Cloudinary:CloudName/ApiKey/ApiSecret

dotnet run
# → https://localhost:5067
```

**Frontend:**
```bash
cd rair-frontend

# Create .env with:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_API_BASE_URL=https://localhost:5067  (or Render URL for prod)

npm install
npm run dev
```

---

## Branching

| Branch | Purpose |
|---|---|
| `main` | Production, auto-deploys to Vercel + Render |
| `develop` | Active development, PRs merge here first |

---

## Live

| Service | URL |
|---|---|
| Frontend | Deployed on Vercel |
| Backend API | `https://raircore-api.onrender.com` |
