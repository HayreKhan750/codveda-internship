# Codveda Internship - Level 3 (Advanced)

## Overview
Level 3 implements an **Advanced MERN Stack application** with **WebSockets**, **GraphQL**, **Performance Optimization**, and **Production Deployment**. This builds upon Level 2's foundation and covers all 3 Level 3 tasks:

- ✅ **Task 1**: Full-Stack Application with Deployment Configuration
- ✅ **Task 2**: WebSockets with Socket.io for Real-Time Communication
- ✅ **Task 3**: GraphQL API as Alternative to REST

## Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** (jsonwebtoken) - Authentication tokens
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Apollo Server** - GraphQL server
- **Helmet** - Security middleware
- **Compression** - Response compression
- **Rate Limiting** - DDoS protection
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **Apollo Client** - GraphQL client
- **Socket.io Client** - Real-time client
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy & static file serving
- **Redis** - Session storage (optional)

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

## Level 3 Features Demonstration

### 1. Real-Time Chat
- Navigate to `/chat`
- Select a user from the sidebar
- Send and receive messages in real-time
- See online/offline status updates

### 2. GraphQL Playground
- Navigate to `/graphql`
- Test queries and mutations interactively
- Try the pre-built examples:
  - Get current user: `query { me { id name email role } }`
  - Get all users: `query { users { id name email department role } }`
  - Send message: `mutation { sendMessage(recipientId: "...", content: "Hello!") { id content } }`

### 3. Real-Time Notifications
- Notifications appear in the top-right corner
- Badge shows unread count
- Click to mark as read
- Real-time updates when new notifications arrive

## Docker Deployment (Recommended)

### Quick Start
```bash
cd level-3
cp .env.example .env
docker-compose up -d
```

### Access Points
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000
- GraphQL Playground: http://localhost:5000/graphql
- MongoDB: localhost:27017

## API Endpoints

### REST API (Level 2)
- Auth Routes: `/api/auth` (register, login, profile)
- User Routes: `/api/users` (CRUD, stats)

### GraphQL API (Level 3)
- Endpoint: `/graphql`
- Queries: me, users, messages, notifications, userStats
- Mutations: register, login, updateProfile, sendMessage
- Subscriptions: messageReceived, notificationReceived

### WebSocket Events
- Real-time messaging and notifications
- User status updates
- Connection management

## Performance & Security

- **Rate Limiting**: 100 requests per 15 minutes
- **Security Headers**: Helmet.js protection
- **Response Compression**: Gzip enabled
- **Health Checks**: Automated monitoring
- **Docker Security**: Non-root user execution

## License

This project is part of Codveda Internship Program.

---

**Level 3 Complete**: Advanced MERN Stack with WebSockets, GraphQL, and Production Deployment 🚀
