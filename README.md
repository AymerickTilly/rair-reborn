# Rair Reborn

A full rebuild of the [Rair Clothing](https://github.com/AymerickTilly/Cloud-Computing) platform, migrating from a serverless AWS architecture to a modern, maintainable stack built on .NET, Supabase, and Vercel.

---

## Why This Rebuild?

The original Rair project was built as a university cloud computing assignment using AWS. While it worked, several practical limitations emerged:

- **AWS account dependency** — losing access to the AWS account meant losing the entire backend: Lambda functions, DynamoDB data, Cognito user pool, and S3 assets. No export, no recovery.
- **Vendor lock-in** — every layer was AWS-specific: Amplify for auth, DynamoDB for storage, Lambda for logic. Swapping any one piece required rewriting the others.
- **No local development** — Lambda functions could not be run locally without mocking or AWS SAM, making iteration slow.
- **Cost unpredictability** — AWS pricing scales with usage in ways that are hard to predict for a small project. The original project spent $1.73 over two months with minimal traffic.
- **JS Lambda functions** — business logic was split across dozens of individual Lambda files with no shared types, no ORM, and no structured error handling.

The rebuild addresses all of these by owning the backend, using open standards (JWT, REST, PostgreSQL), and choosing platforms with genuine free tiers.

---

## What Changed

| Layer | Before (AWS) | After (Reborn) |
|---|---|---|
| Frontend hosting | S3 + CloudFront | Vercel |
| Authentication | AWS Cognito + Amplify | Supabase Auth |
| Backend | AWS Lambda (Node.js) | ASP.NET Core Web API (.NET 10) |
| Database | DynamoDB (NoSQL) | PostgreSQL via Supabase |
| Image storage | S3 | Cloudinary |
| CI/CD | AWS CodePipeline | GitHub Actions (Vercel + Azure) |
| Domain | Route 53 | TBD |

---

## New Technology Stack

### ASP.NET Core Web API (.NET 10)
The backend is a structured REST API written in C#. Unlike the original Lambda approach where each endpoint was a separate file with no shared context, the new backend uses:
- **Controllers** — groups of related endpoints (Products, Orders, Cart, Users, Images)
- **Entity Framework Core** — ORM that maps C# classes to PostgreSQL tables and handles all SQL generation
- **Dependency Injection** — services (DB context, Cloudinary client) are registered once and injected where needed
- **JWT Middleware** — a single `[Authorize]` attribute protects every route, validating Supabase-issued tokens via HMAC-SHA256

### Supabase
Replaces both Cognito (auth) and DynamoDB (database):
- **Auth** — issues standard JWTs compatible with our .NET middleware. Sign up, sign in, password reset all handled out of the box.
- **PostgreSQL** — relational database replacing DynamoDB's schema-less NoSQL. Data relationships (orders containing products, products containing stock variants) are now enforced at the DB level with foreign keys.

### Cloudinary
Replaces S3 for image storage:
- Images are uploaded via the backend API (base64 → Cloudinary SDK → public URL)
- Automatic format conversion (`f_auto`) and quality optimisation (`q_auto`) applied at the CDN level
- No presigned URLs or IAM policies required

### Vercel
Replaces S3 static hosting for the React frontend:
- Automatic preview deployments on every branch push
- Zero config for Vite/React projects
- The `develop` branch gets its own preview URL for testing before merging to `main`

---

## Architecture

```
User Browser
     │
     ▼
┌─────────────┐
│   Vercel    │  React + Vite + TypeScript (frontend)
└──────┬──────┘
       │ HTTPS REST calls (Bearer JWT)
       ▼
┌─────────────┐
│    Azure    │  ASP.NET Core Web API (.NET 10)
│ App Service │  Controllers → EF Core → PostgreSQL
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
Supabase  Cloudinary
PostgreSQL  Images
```

---

## Project Structure

```
rair-reborn/
├── RairCore/
│   ├── Controllers/
│   │   ├── ProductsController.cs   # GET/POST/PUT/DELETE /product(s)
│   │   ├── UsersController.cs      # GET/POST/PUT /user(s)
│   │   ├── CartController.cs       # GET/POST/PUT/DELETE /cart
│   │   ├── OrdersController.cs     # GET/POST/PUT/DELETE /order(s)
│   │   └── ImagesController.cs     # POST/DELETE /image
│   ├── Models/
│   │   ├── Product.cs + StockItem.cs
│   │   ├── User.cs
│   │   ├── Cart.cs
│   │   └── Order.cs + OrderProduct.cs
│   ├── Data/
│   │   └── AppDbContext.cs         # EF Core DB context
│   ├── Migrations/                 # Auto-generated DB migration files
│   └── Program.cs                  # App entry point + middleware pipeline
└── product-images.md               # Cloudinary image URLs reference
```

---

## API Endpoints

All endpoints require a valid Supabase JWT via `Authorization: Bearer <token>`.

| Method | Endpoint | Action |
|---|---|---|
| GET | `/products` | List all products |
| GET | `/product?productId=` | Get one product |
| POST | `/product` | Create product |
| PUT | `/product` | Update product |
| DELETE | `/product?productId=` | Delete product |
| GET | `/users` | List all users |
| GET | `/user?userId=` | Get one user |
| POST | `/user` | Create user |
| PUT | `/user` | Update user |
| GET | `/orders` | List all orders |
| GET | `/order?orderId=` | Get one order |
| POST | `/order` | Create order |
| PUT | `/order` | Update order (status) |
| DELETE | `/order?orderId=` | Delete order |
| GET | `/cart?userId=` | Get user's cart |
| POST | `/cart` | Add to cart |
| PUT | `/cart` | Update cart item |
| DELETE | `/cart?userId=&cartId=` | Remove cart item |
| POST | `/image` | Upload image to Cloudinary |
| DELETE | `/image?imageUrl=` | Delete image from Cloudinary |

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/AymerickTilly/rair-reborn.git
cd rair-reborn/RairCore

# Fill in your credentials in appsettings.json
# (Supabase URL, JWT secret, DB connection string, Cloudinary keys)

# Run the API
dotnet run
# → http://localhost:5067
```

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — deploys to Azure App Service |
| `develop` | Active development — PRs go here first |

---

## Frontend

The React frontend lives in a separate repo: [Cloud-Computing](https://github.com/AymerickTilly/Cloud-Computing)

The `develop` branch of that repo is being updated to point to this API instead of the original AWS endpoints.
