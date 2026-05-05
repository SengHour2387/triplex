# TEMPLEX

# Triplex Social Media API

A Node.js + PostgreSQL backend for a social media Flutter frontend.

## Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=triplex_db
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_change_this_in_production
```

3. **Create PostgreSQL database:**

```bash
createdb triplex_db
```

4. **Run the server:**

```bash
npm start        # Production
npm run dev      # Development with auto-reload
```

## API Endpoints

### Auth Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user

### User Routes (`/api/users`)

- `GET /profile/:userId` - Get user profile
- `PUT /profile` - Update current user profile (auth required)
- `POST /follow/:userId` - Follow a user (auth required)
- `DELETE /unfollow/:userId` - Unfollow a user (auth required)
- `GET /:userId/followers` - Get user's followers
- `GET /:userId/following` - Get user's following list

### Post Routes (`/api/posts`)

- `POST /` - Create post (auth required)
- `GET /feed` - Get feed for authenticated user (auth required)
- `GET /:postId` - Get specific post
- `GET /user/:userId` - Get all posts by user
- `PUT /:postId` - Update post (auth required)
- `DELETE /:postId` - Delete post (auth required)

### Like Routes (`/api/posts`)

- `POST /:postId/like` - Like a post (auth required)
- `DELETE /:postId/like` - Unlike a post (auth required)
- `GET /:postId/likes` - Get all likes on a post

### Comment Routes (`/api/posts`)

- `POST /:postId/comments` - Create comment (auth required)
- `GET /:postId/comments` - Get all comments on post
- `DELETE /comment/:commentId` - Delete comment (auth required)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. **Register/Login** to get a token
2. **Include token in requests:**

```
Authorization: Bearer <your_token>
```

## Database Schema

### Users Table

- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- bio
- profile_picture_url
- created_at
- updated_at

### Posts Table

- id (PK)
- user_id (FK)
- caption
- image_url
- likes_count
- comments_count
- created_at
- updated_at

### Likes Table

- id (PK)
- user_id (FK)
- post_id (FK)
- created_at
- (UNIQUE on user_id + post_id)

### Comments Table

- id (PK)
- user_id (FK)
- post_id (FK)
- text
- created_at
- updated_at

### Followers Table

- id (PK)
- follower_id (FK)
- following_id (FK)
- created_at
- (UNIQUE on follower_id + following_id)
- (CHECK follower_id != following_id)

## Example Requests

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Create Post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "caption": "Beautiful sunset! 🌅",
    "image_url": "https://example.com/image.jpg"
  }'
```

### Get Feed

```bash
curl -X GET http://localhost:3000/api/posts/feed \
  -H "Authorization: Bearer <token>"
```

## Features

✅ User Authentication (Register/Login with JWT)
✅ User Profiles (View, Update, Follow/Unfollow)
✅ Posts (Create, Read, Update, Delete)
✅ Likes (Like/Unlike posts, View likes)
✅ Comments (Create, View, Delete)
✅ Follow System (Follow/Unfollow users, View followers/following)
✅ Feed (Get posts from followed users)
✅ CORS Support (Ready for Flutter frontend)

## Development

### Run in development mode with auto-reload:

```bash
npm run dev
```

### Check health:

```bash
curl http://localhost:3000/api/health
```

## Security Considerations

- Password hashing with bcryptjs
- JWT token expiration (30 days)
- Input validation
- SQL injection protection (using parameterized queries)
- CORS configuration
- Error handling with safe error messages

## Notes for Flutter Frontend

- Include `Authorization: Bearer <token>` in headers for authenticated requests
- Token is returned on `/api/auth/register` and `/api/auth/login`
- All timestamps are in ISO 8601 format
- Use pagination with `?page=1` query parameter
- Images are stored as URLs (provide your own image storage solution)

## Deployment

For production:

1. Set `NODE_ENV=production` in `.env`
2. Generate a strong `JWT_SECRET`
3. Use environment variables from your hosting provider
4. Consider using a process manager like PM2
5. Set up HTTPS/SSL
6. Configure proper CORS origins

## License

- ISC
