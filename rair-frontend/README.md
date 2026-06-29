# RAIR Clothing — Cloud Computing Project

A cloud-native e-commerce web application built as a university team project. RAIR Clothing is an online fashion platform targeting New Zealand customers, allowing users to browse and purchase clothing, manage their cart, and track orders — while giving store administrators tools to manage inventory and fulfil orders.

## 🛍️ About the Platform

RAIR bridges the gap between a physical clothing store and online retail. Customers can create accounts, browse a product catalogue, add items to their cart by size and quantity, check out, and view their order history. Store admins get a dedicated dashboard to add and update products, manage stock levels, and oversee all customer orders.

## ☁️ Cloud Architecture

The application is built on a fully **serverless AWS architecture**:

- **AWS Cognito** — User authentication & authorisation, with `Customer` and `Admin` user groups
- **AWS S3** — Static website hosting and product image storage
- **AWS API Gateway** — RESTful API management for all CRUD operations
- **AWS Lambda** — Serverless backend logic (Node.js v22)
- **AWS DynamoDB** — NoSQL database storing users, products, carts, and orders
- **AWS Route 53** — Custom domain management (`rair-shop.xyz`)
- **AWS CodePipeline + CodeBuild** — CI/CD pipeline triggered on GitHub pushes

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, React Bootstrap |
| Backend | Node.js (AWS Lambda) |
| Database | AWS DynamoDB |
| Auth | AWS Cognito + Amplify |
| Hosting | AWS S3 + Route 53 |
| CI/CD | GitHub → AWS CodePipeline → CodeBuild → S3 |

## 🗄️ Data Model

Four DynamoDB tables: **User**, **Product**, **Cart**, and **Order**, which were designed to support dynamic inventory tracking, size-specific stock management, and full order lifecycle handling.

## 🔗 Links

- **Live Site:** https://rair-shop.xyz (Project removed from AWS to remove fees)
- **Total AWS Cost:** ~$1.73 (mid-April to early June 2025)
