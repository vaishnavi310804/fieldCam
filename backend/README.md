# FieldCam Backend Services

Welcome to the **FieldCam Backend** repository. This directory contains the microservices powering the FieldCam backend infrastructure, built with Node.js, Express (ES Modules), and MongoDB.

---

## 📁 Directory Structure

```
backend/
├── README.md
├── auth-service/                     # Authentication & User Management Service
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection configuration using Mongoose
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT / authentication validation middleware
│   │   │   └── error.middleware.js   # Centralized error handling middleware
│   │   ├── modules/
│   │   │   └── auth/                 # Auth feature module
│   │   │       ├── auth.controller.js  # Request handlers & HTTP responses
│   │   │       ├── auth.model.js       # Mongoose user/auth schema & model
│   │   │       ├── auth.routes.js      # Express router definitions
│   │   │       ├── auth.service.js     # Business logic & DB interaction
│   │   │       ├── auth.utils.js       # Helper utilities (token gen, hashing)
│   │   │       └── auth.validation.js  # Schema validation (Joi/Zod/custom)
│   │   └── utils/                    # Shared utility functions across auth-service
│   ├── index.js                      # Main Express application definition & route setup
│   ├── server.js                     # Application entry point loading environment variables
│   ├── package.json                  # Dependencies & npm scripts for auth-service
│   ├── package-lock.json
│   ├── .env                          # Environment configuration
│   └── .gitignore                    # Git ignore file
└── platform-service/                 # Core Platform & Business Logic Service
    ├── src/
    │   ├── config/
    │   │   └── db.js                 # MongoDB connection configuration using Mongoose
    │   └── middleware/
    │       └── error.middleware.js   # Centralized error handling middleware
    ├── index.js                      # Main Express application definition & route setup
    ├── server.js                     # Application entry point loading environment variables
    ├── package.json                  # Dependencies & npm scripts for platform-service
    └── package-lock.json
```

---

## 🚀 Services Overview

### 1. Auth Service (`auth-service`)
- **Purpose**: Handles authentication, token generation, user verification, and account security.
- **Default Port**: `5000`
- **Key Dependencies**:
  - `express` (v5.x) - Web framework
  - `mongoose` - MongoDB ODM
  - `jsonwebtoken` - JWT generation and verification
  - `bcryptjs` - Password hashing
  - `cors` - Cross-Origin Resource Sharing
  - `dotenv` - Environment variable configuration

### 2. Platform Service (`platform-service`)
- **Purpose**: Manages core platform capabilities and domain business logic.
- **Default Port**: `5001`
- **Key Dependencies**:
  - `express` (v5.x) - Web framework
  - `mongoose` - MongoDB ODM
  - `cors` - Cross-Origin Resource Sharing
  - `dotenv` - Environment variable configuration

---

## ⚙️ Environment Variables

Each microservice relies on environment variables. Create a `.env` file in the root directory of each respective service before starting the applications:

### `auth-service/.env`
```env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/fieldcam_auth
JWT_SECRET=your_jwt_secret_key
```

### `platform-service/.env`
```env
PORT=5001
DATABASE_URL=mongodb://localhost:27017/fieldcam_platform
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) instance running locally or via MongoDB Atlas

### Installation & Running Services

#### Running `auth-service`:
```bash
cd backend/auth-service
npm install

# Start in development mode with live reloading
npm run dev

# Start in production mode
npm start
```

#### Running `platform-service`:
```bash
cd backend/platform-service
npm install

# Start in development mode with live reloading
npm run dev

# Start in production mode
npm start
```

---

## 📡 Base API Endpoints

| Service | Port | Base URL | Health Check / Status |
| :--- | :--- | :--- | :--- |
| Auth Service | `5000` | `http://localhost:5000` | `GET /` -> `"API running"` |
| Platform Service | `5001` | `http://localhost:5001` | `GET /` -> `"API running"` |
