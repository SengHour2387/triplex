# Triplex Social Media API - Quick Start Guide

## 🚀 Getting Started

Your Node.js + PostgreSQL backend for Flutter social media app is ready!

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Verify Database Configuration

Check your `.env` file - it's already configured with:

- DB: triplex_database
- User: user
- Password: 2387
- Host: 127.0.0.1:5432

### Step 3: Start the Server

```bash
npm start        # Production mode
npm run dev      # Development mode (with file watching)
```

You should see:

```
✓ Database schema initialized
✓ Server is running on http://localhost:3000
✓ Environment: development
```

### Step 4: Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Welcome endpoint
curl http://localhost:3000/
```

## 📱 Flutter Integration Steps

1. **Set API Base URL** in Flutter:

```dart
const String apiUrl = 'http://localhost:3000/api';
// For iOS simulator: http://localhost:3000/api
// For Android emulator: http://10.0.2.2:3000/api
```

2. **Create Authentication Flow:**

```dart
// Register
POST /auth/register
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}

// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

3. **Store JWT Token** locally (using shared_preferences)

4. **Include Token** in all authenticated requests:

```dart
headers: {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
}
```

## 🎯 Core Features

### Authentication

- ✅ User Registration
- ✅ User Login with JWT
- ✅ Protected Routes

### User Management

- ✅ View User Profiles
- ✅ Update Profile (Bio, Picture)
- ✅ Follow/Unfollow Users
- ✅ View Followers & Following

### Social Features

- ✅ Create Posts with Images
- ✅ View Feed (from followed users)
- ✅ Like/Unlike Posts
- ✅ Comment on Posts
- ✅ Delete Comments

### Pagination

- ✅ Feed Pagination
- ✅ User Posts Pagination
- ✅ Comments Pagination

## 📁 Project Structure

```
triplex_node/
├── app.js                    # Main server file
├── db.js                     # Database connection
├── package.json              # Dependencies
├── .env                      # Environment variables
├── README.md                 # Full documentation
├── models/
│   └── init.js              # Database schema initialization
├── middleware/
│   └── auth.js              # JWT authentication & error handling
├── controllers/
│   ├── authController.js    # Register & Login
│   ├── userController.js    # User profiles & following
│   ├── postController.js    # Post CRUD operations
│   ├── likeController.js    # Like/Unlike posts
│   └── commentController.js # Comments
└── routes/
    ├── auth.js              # Authentication routes
    ├── users.js             # User routes
    ├── posts.js             # Post routes
    ├── likes.js             # Like routes
    └── comments.js          # Comment routes
```

## 🔗 Important API Endpoints

### For Flutter App:

**1. Register User**

```
POST /api/auth/register
```

**2. Login**

```
POST /api/auth/login
```

**3. Get User Profile**

```
GET /api/users/profile/:userId
```

**4. Update Profile**

```
PUT /api/users/profile
(requires auth)
```

**5. Create Post**

```
POST /api/posts
(requires auth)
```

**6. Get Feed**

```
GET /api/posts/feed
(requires auth)
```

**7. Like Post**

```
POST /api/posts/:postId/like
(requires auth)
```

**8. Add Comment**

```
POST /api/posts/:postId/comments
(requires auth)
```

**9. Follow User**

```
POST /api/users/follow/:userId
(requires auth)
```

## 🛠️ Development Tips

1. **Auto-reload during development:**

   ```bash
   npm run dev
   ```

2. **Test endpoints with cURL or Postman:**
   - Import endpoints from routes/ folder descriptions

3. **Check database health:**

   ```bash
   curl http://localhost:3000/api/health
   ```

4. **JWT Token Example Structure:**
   ```javascript
   {
     "userId": 1,
     "username": "john_doe",
     "iat": 1234567890,
     "exp": 1237159690
   }
   ```

## 🐛 Troubleshooting

| Issue                 | Solution                                          |
| --------------------- | ------------------------------------------------- |
| Connection refused    | Check PostgreSQL is running & .env DB config      |
| Port 3000 in use      | Change PORT in .env to another port               |
| Token invalid         | Token may have expired (30 days)                  |
| CORS error in Flutter | CORS is already enabled in app.js                 |
| Image not saving      | Store image URL, implement separate image service |

## 📚 Next Steps

1. ✅ Test API with Postman/cURL
2. ✅ Connect Flutter app to backend
3. ✅ Implement image upload service (Firebase, AWS S3, etc.)
4. ✅ Add real-time notifications (Socket.io)
5. ✅ Deploy to production server

## 🔐 Before Production

1. Change `JWT_SECRET` to a strong random key
2. Enable HTTPS
3. Set `NODE_ENV=production`
4. Configure database backups
5. Set up error monitoring
6. Rate limiting for API endpoints
7. Input validation & sanitization

---

**Need help?** Check the full [README.md](./README.md) for detailed documentation.

Happy coding! 🎉
