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
| Bootstrap Reboot | Base element styles only. Modals are a small native `<dialog>` component |
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

All routes require a valid Supabase JWT via `Authorization: Bearer <token>`, except `GET /health`.

Store management (create, update and delete products, list users, delete orders, and the image endpoints) also requires the Admin role, which is read from the token's `app_metadata.role` (`user_metadata` is user-editable and is never trusted). Customers can only read and change their own orders, cart and profile.

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

**Render instead of Lambda:** Lambda enforced a one-function-per-endpoint model with no shared types, no ORM, and no structured error handling. A single ASP.NET Core container on Render runs all endpoints in one process with full access to EF Core, dependency injection, and C# type safety. The free tier sleeps when idle, so the first request after a quiet period is slow. The frontend pings the unauthenticated `/health` endpoint as soon as it loads to wake the API, and an external uptime pinger can keep it awake.

**PostgreSQL instead of DynamoDB:** Orders containing products with sizes and quantities are inherently relational. DynamoDB required denormalizing everything into flat documents. PostgreSQL enforces relationships with foreign keys and lets EF Core generate all SQL.

**Cloudinary instead of S3:** S3 requires IAM roles, presigned URLs, and bucket policies. Cloudinary accepts a base64 upload and returns a public CDN URL. The frontend requests images with `f_auto`, `q_auto` and a width limit (`c_limit,w_N`), so a 2.4 MB original PNG is served as a ~30 kB WebP.

**OKLCH design tokens:** The entire color system is defined in OKLCH (`--rair-bg`, `--rair-primary`, `--rair-muted`, `--rair-border`, `--rair-ink`). OKLCH provides perceptually uniform lightness, making it easier to build accessible contrast ratios without guessing.

---

## Order Lifecycle

```
PROCESSING → SHIPPED → DELIVERED
     │
     └── CANCELLED (from PROCESSING only, by customer or admin)
```

Placing an order happens in one database transaction: the API prices the items from the catalogue, checks and decrements stock with an atomic conditional update (two buyers cannot take the last item), and clears the ordered cart items. If any item is short, nothing changes.

Cancelling an order, by the customer or an admin, puts the items back in stock exactly once. A cancelled order cannot be reopened. Admins can move an order between the other statuses; customers can only cancel their own order while it is PROCESSING.

---

## Project Structure

```
rair-reborn/
├── Dockerfile                         # Container for Render
├── RairCore/                          # ASP.NET Core Web API
│   ├── Auth/
│   │   └── CurrentUser.cs             # Reads the user id and Admin role from the JWT
│   ├── Controllers/
│   │   ├── ProductsController.cs      # /products + /product
│   │   ├── UsersController.cs         # /users + /user
│   │   ├── CartController.cs          # /cart
│   │   ├── OrdersController.cs        # /orders + /order
│   │   └── ImagesController.cs        # /image
│   ├── Models/
│   │   ├── Product.cs + StockItem.cs
│   │   ├── User.cs
│   │   ├── Cart.cs
│   │   └── Order.cs + OrderProduct.cs
│   ├── Data/
│   │   └── AppDbContext.cs            # EF Core context
│   ├── Migrations/                    # EF Core migrations
│   ├── migration.sql                  # Idempotent SQL of all migrations (run in Supabase)
│   └── Program.cs                     # Entry point + middleware pipeline
└── rair-frontend/                     # React frontend
    ├── src/
    │   ├── pages/                     # Route-level components
    │   ├── components/                # Shared UI components
    │   ├── api/                       # Fetch wrappers for each endpoint
    │   ├── lib/                       # Supabase client, Cloudinary image URLs, shared options
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
# Cloudinary:CloudName / ApiKey / ApiSecret
# Optional: AllowedOrigins (the frontend origin for CORS, default http://localhost:5173)

dotnet run
# Listens on the PORT environment variable, default 8080 → http://localhost:8080
```

Apply `RairCore/migration.sql` to the database (Supabase SQL editor) to create the tables and indexes.

**Frontend:**
```bash
cd rair-frontend

# Create .env (see .env_example) with:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
# VITE_API_URL=http://localhost:8080   (optional, defaults to the deployed Render API)

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
