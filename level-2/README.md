# Codveda Internship - Level 2 (Intermediate)

## Overview
Level 2 implements a **MERN Stack application** with **JWT Authentication**, **MongoDB Database**, and **React Frontend**. This covers all 3 Level 2 tasks:

- ✅ **Task 1**: Frontend with React Framework
- ✅ **Task 2**: Authentication & Authorization (JWT + bcrypt)
- ✅ **Task 3**: Database Integration (MongoDB + Mongoose)

## Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** (jsonwebtoken) - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

## Project Structure

```
level-2/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   └── User.js          # Mongoose User model
│   ├── routes/
│   │   ├── authRoutes.js    # Login, Register, Profile
│   │   └── userRoutes.js    # CRUD operations (admin only)
│   ├── .env                 # Environment variables
│   ├── .env.example         # Example env file
│   ├── package.json
│   ├── seed.js              # Sample data seeder
│   └── server.js            # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React Context (AuthContext)
│   │   ├── pages/           # Page components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Features

### Authentication
- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcrypt (12 salt rounds)
- Protected routes middleware
- Role-based access control (user/admin)
- Token-based authentication (Bearer token)

### Database (MongoDB)
- User schema with validation
- Indexing for performance (email, createdAt)
- Soft delete functionality
- Department and role management
- Data relationships

### API Endpoints

#### Auth Routes (`/api/auth`)
- `POST /register` - Create new account
- `POST /login` - Authenticate user
- `GET /me` - Get current user (protected)
- `PUT /update-profile` - Update profile (protected)

#### User Routes (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /profile` - Get user profile
- `GET /:id` - Get specific user (admin only)
- `PUT /:id` - Update user (admin only)
- `DELETE /:id` - Soft delete user (admin only)
- `GET /stats/overview` - Get statistics (admin only)

### Frontend Features
- Modern React with Hooks
- Context API for state management
- Protected routes with authentication check
- Responsive design
- Loading states and error handling
- Admin and User role-based UI

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Install Backend Dependencies
```bash
cd level-2/backend
npm install
```

### Step 2: Configure Environment
```bash
# Edit .env file
MONGODB_URI=mongodb://localhost:27017/codveda_level2
JWT_SECRET=your-secret-key-here
```

### Step 3: Seed Database (Optional)
```bash
npm run seed
```

### Step 4: Start Backend Server
```bash
npm start
# or
npm run dev
```

Server runs on `http://localhost:5000`

### Step 5: Install Frontend Dependencies
```bash
cd level-2/frontend
npm install
```

### Step 6: Start Frontend Development Server
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Default Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@codveda.com | admin123 |
| User | john@example.com | password123 |
| User | jane@example.com | password123 |

## API Testing

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "age": 25,
    "department": "engineering"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@codveda.com",
    "password": "admin123"
  }'
```

### Get Users (Admin)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users
```

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Authentication**: 30-day expiration
3. **Protected Routes**: Middleware checks authentication
4. **Role-based Access**: Admin vs User permissions
5. **Input Validation**: express-validator for sanitization
6. **Soft Delete**: Users marked inactive, not deleted
7. **HTTP-only Cookies**: Ready for cookie-based auth

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/codveda_level2 |
| `JWT_SECRET` | JWT signing secret | your-secret-key |

## Next Steps (Level 3)

Level 3 (Advanced) includes:
- Full-stack deployment (MERN/MEVN/PERN)
- WebSockets with Socket.io (real-time features)
- GraphQL API alternative
- Performance optimization
- Advanced security features

## License

This project is part of Codveda Internship Program.
