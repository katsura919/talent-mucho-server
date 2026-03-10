# AVSPH Backend

A modern Node.js backend API built with **Fastify** and **TypeScript** for managing multiple businesses in one platform with role-based access control.

## 🚀 Features

- ⚡ **Fastify** - High-performance web framework
- 🔷 **TypeScript** - Type-safe development
- 🔒 **Security** - Helmet for secure HTTP headers
- 🌐 **CORS** - Cross-Origin Resource Sharing support
- ✅ **Zod** - Runtime validation with TypeScript inference
- 📝 **Environment** - Type-safe environment configuration
- 🔥 **Hot Reload** - Fast development with tsx
- 👥 **Multi-Admin** - Role-based access control with super-admin and admin roles
- 🏢 **Multi-Business** - Manage multiple businesses with granular permissions
- 📝 **Blog Management** - Content management system for each business
- 🔐 **JWT Authentication** - Secure token-based authentication

## 📁 Project Structure

```
src/
├── config/           # Configuration and environment schemas
│   ├── env.ts        # Zod schema for environment variables
│   └── index.ts
├── plugins/          # Fastify plugins
│   ├── cors.ts       # CORS configuration
│   ├── env.ts        # Environment plugin
│   ├── security.ts   # Helmet security headers
│   ├── sensible.ts   # Useful utilities
│   └── index.ts
├── routes/           # API routes
│   ├── health.ts     # Health check endpoint
│   ├── users.ts      # Example user routes
│   └── index.ts
└── index.ts          # Application entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### Admin Management

| Method | Endpoint                | Description                          | Auth Required    |
| ------ | ----------------------- | ------------------------------------ | ---------------- |
| POST   | `/api/admin/register`   | Register admin (first = super-admin) | No (first admin) |
| POST   | `/api/admin/login`      | Admin login                          | No               |
| GET    | `/api/admin/me`         | Get current admin info               | Yes              |
| GET    | `/api/admin/admins`     | Get all admins                       | Super-Admin      |
| GET    | `/api/admin/admins/:id` | Get admin by ID                      | Super-Admin      |
| PUT    | `/api/admin/admins/:id` | Update admin & business access       | Super-Admin      |
| DELETE | `/api/admin/admins/:id` | Delete admin                         | Super-Admin      |

### Business Management

| Method | Endpoint                     | Description                             | Auth Required     |
| ------ | ---------------------------- | --------------------------------------- | ----------------- |
| GET    | `/api/businesses`            | Get all businesses (filtered by access) | Optional          |
| GET    | `/api/businesses/:id`        | Get business by ID                      | No                |
| GET    | `/api/businesses/slug/:slug` | Get business by slug                    | No                |
| POST   | `/api/businesses`            | Create new business                     | Yes               |
| PUT    | `/api/businesses/:id`        | Update business                         | Yes (with access) |
| DELETE | `/api/businesses/:id`        | Delete business                         | Yes (with access) |

### Blog Management

| Method | Endpoint                            | Description                | Auth Required     |
| ------ | ----------------------------------- | -------------------------- | ----------------- |
| GET    | `/api/blogs`                        | Get all blogs              | No                |
| GET    | `/api/blogs/:id`                    | Get blog by ID             | No                |
| GET    | `/api/blogs/slug/:slug`             | Get published blog by slug | No                |
| GET    | `/api/businesses/:businessId/blogs` | Get blogs by business      | No                |
| POST   | `/api/blogs`                        | Create new blog            | Yes (with access) |
| PUT    | `/api/blogs/:id`                    | Update blog                | Yes (with access) |
| DELETE | `/api/blogs/:id`                    | Delete blog                | Yes (with access) |

### User/Staff Management

| Method | Endpoint         | Description      | Auth Required |
| ------ | ---------------- | ---------------- | ------------- |
| GET    | `/api/users`     | Get all staff    | Yes           |
| GET    | `/api/users/:id` | Get staff by ID  | Yes           |
| POST   | `/api/users`     | Create new staff | Yes           |
| PUT    | `/api/users/:id` | Update staff     | Yes           |
| DELETE | `/api/users/:id` | Delete staff     | Yes           |

## ⚙️ Environment Variables

| Variable      | Description               | Default                           | Required |
| ------------- | ------------------------- | --------------------------------- | -------- |
| `PORT`        | Server port               | `3000`                            | No       |
| `HOST`        | Server host               | `0.0.0.0`                         | No       |
| `NODE_ENV`    | Environment               | `development`                     | No       |
| `CORS_ORIGIN` | Allowed CORS origins      | `http://localhost:5173`           | No       |
| `API_PREFIX`  | API route prefix          | `/api`                            | No       |
| `LOG_LEVEL`   | Logging level             | `info`                            | No       |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/avsph` | No       |
| `JWT_SECRET`  | Secret key for JWT tokens | -                                 | **Yes**  |

**Important:** Generate a strong `JWT_SECRET` (minimum 32 characters) for production!

## 📜 Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Build for production     |
| `npm start`        | Start production server  |
| `npm run lint`     | Run ESLint               |
| `npm run lint:fix` | Fix ESLint issues        |

## � Access Control & Roles

### Super-Admin

- **Automatic Assignment:** First registered admin becomes super-admin
- **Capabilities:**
  - Full access to all businesses
  - Create/update/delete other admins
  - Assign business permissions to admins
  - Manage all content across all businesses

### Admin

- **Assignment:** Created by super-admin with specific business access
- **Capabilities:**
  - Access only assigned businesses
  - Create/update/delete blogs for assigned businesses
  - View only businesses they have access to
  - Cannot manage other admins

### Workflow Example

1. First admin registers → Automatically becomes super-admin
2. Super-admin creates businesses
3. Super-admin creates co-admins and assigns them to specific businesses
4. Co-admins can only manage content for their assigned businesses
5. When co-admin logs in, they see only their assigned businesses

## 🏗️ Architecture

### Role-Based Access Control (RBAC)

- **Admin Collection:** Stores `role` (super-admin/admin) and `businessIds[]`
- **Business Collection:** Stores `adminIds[]` (admins with access) and `createdBy`
- **Blog Collection:** Validates business access before creation/update
- **Middleware:** `authenticate`, `requireSuperAdmin`, `authorizeBusinessAccess`

### Key Security Features

- JWT tokens include admin ID, email, and role
- Business operations check `adminIds` array for authorization
- Super-admins bypass business-level restrictions
- Admins cannot delete themselves
- Password hashing with bcrypt (10 rounds)
- Protected routes with preHandler hooks

## �📄 License

ISC
#   a v s p h - b a c k e n d 
 
 
#   t a l e n t - m u c h o - s e r v e r  
 