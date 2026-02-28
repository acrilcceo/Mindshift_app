# MindShift Authentication Documentation

## Overview

MindShift uses a Node.js backend for authentication with two supported methods:
1. **Email & Password** - Traditional credential-based authentication
2. **Google OAuth 2.0** - Social login via Passport.js

All authentication flows use JWT (JSON Web Tokens) for session management.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Node.js API    │────▶│    MongoDB      │
│   (Frontend)    │◀────│  (Express)      │◀────│   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Google OAuth   │
                        │  (Passport.js)  │
                        └─────────────────┘
```

### Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React + TypeScript                  |
| Backend    | Node.js + Express.js                |
| Auth       | Passport.js, JWT, bcrypt            |
| Database   | MongoDB + Mongoose ODM              |
| Validation | Zod                                 |

---

## Database Schema

```typescript
// models/User.ts

import mongoose, { Schema, Document } from 'mongoose';

export type AuthProvider = 'LOCAL' | 'GOOGLE';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash?: string;     // Null for OAuth-only users
  name?: string;
  avatar?: string;
  provider: AuthProvider;
  providerId?: string;       // Google ID for OAuth users
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      trim: true,
    },
    avatar: String,
    provider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL',
    },
    providerId: {
      type: String,
      index: true,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
```

```typescript
// models/Session.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: String,
    ipAddress: String,
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for auto-cleanup
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Cascade delete sessions when user is deleted
sessionSchema.pre('deleteOne', { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await mongoose.model('Session').deleteMany({ userId: doc._id });
  }
});

export const Session = mongoose.model<ISession>('Session', sessionSchema);
```

```typescript
// models/PasswordReset.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for auto-cleanup
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);
```

```typescript
// models/index.ts

export { User, IUser, AuthProvider } from './User';
export { Session, ISession } from './Session';
export { PasswordReset, IPasswordReset } from './PasswordReset';
```

### Database Connection

```typescript
// lib/database.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

---

## API Endpoints

### Base URL
```
/api/v1/auth
```

### Endpoints Summary

| Method | Endpoint              | Description                    | Auth Required |
|--------|-----------------------|--------------------------------|---------------|
| POST   | `/register`           | Register new user              | No            |
| POST   | `/login`              | Login with email/password      | No            |
| POST   | `/logout`             | Logout current session         | Yes           |
| POST   | `/logout-all`         | Logout all sessions            | Yes           |
| POST   | `/refresh`            | Refresh access token           | No            |
| GET    | `/me`                 | Get current user               | Yes           |
| POST   | `/forgot-password`    | Request password reset         | No            |
| POST   | `/reset-password`     | Reset password with token      | No            |
| POST   | `/verify-email`       | Verify email with token        | No            |
| GET    | `/google`             | Initiate Google OAuth          | No            |
| GET    | `/google/callback`    | Google OAuth callback          | No            |

---

## Authentication Flow 1: Email & Password

### Registration Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ POST /register      │                     │
     │ {email, password,   │                     │
     │  name}              │                     │
     │────────────────────▶│                     │
     │                     │                     │
     │                     │ Validate input      │
     │                     │ (Zod schema)        │
     │                     │                     │
     │                     │ Check email exists  │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ Hash password       │
     │                     │ (bcrypt, 12 rounds) │
     │                     │                     │
     │                     │ Create user         │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ Generate tokens     │
     │                     │ (access + refresh)  │
     │                     │                     │
     │                     │ Create session      │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ Send verification   │
     │                     │ email (async)       │
     │                     │                     │
     │ 201 Created         │                     │
     │ {user, accessToken} │                     │
     │ + Set-Cookie:       │                     │
     │   refreshToken      │                     │
     │◀────────────────────│                     │
     │                     │                     │
```

#### Request
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!",
  "name": "John Doe"
}
```

#### Validation Rules
```typescript
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  name: z.string().min(2).max(100).optional(),
});
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65d8f1a2b3c4d5e6f7890123",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "createdAt": "2026-02-27T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ POST /login         │                     │
     │ {email, password}   │                     │
     │────────────────────▶│                     │
     │                     │                     │
     │                     │ Find user by email  │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ Verify password     │
     │                     │ (bcrypt.compare)    │
     │                     │                     │
     │                     │ Generate tokens     │
     │                     │                     │
     │                     │ Create session      │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │ 200 OK              │                     │
     │ {user, accessToken} │                     │
     │ + Set-Cookie:       │                     │
     │   refreshToken      │                     │
     │◀────────────────────│                     │
     │                     │                     │
```

#### Request
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd!"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "emailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Password Reset Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │ Database │          │  Email   │
└────┬─────┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │                     │
     │ POST /forgot-password                     │                     │
     │ {email}             │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │                     │                     │
     │                     │ Find user           │                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │                     │ Generate reset token│                     │
     │                     │ (crypto.randomBytes)│                     │
     │                     │                     │                     │
     │                     │ Store token (hashed)│                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │                     │ Send reset email    │                     │
     │                     │────────────────────────────────────────▶│
     │                     │                     │                     │
     │ 200 OK              │                     │                     │
     │ {message}           │                     │                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
     │                     │                     │                     │
     │ POST /reset-password│                     │                     │
     │ {token, password}   │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │                     │                     │
     │                     │ Verify token        │                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │                     │ Update password     │                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │                     │ Invalidate all      │                     │
     │                     │ sessions            │                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │ 200 OK              │                     │                     │
     │◀────────────────────│                     │                     │
```

---

## Authentication Flow 2: Google OAuth with Passport.js

### OAuth Configuration

```typescript
// config/passport.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUser } from '../models';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error('No email provided by Google'), undefined);
        }

        // Find or create user
        let user = await User.findOne({
          $or: [
            { providerId: profile.id, provider: 'GOOGLE' },
            { email: email.toLowerCase() },
          ],
        });

        if (!user) {
          // Create new user
          user = await User.create({
            email: email.toLowerCase(),
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            provider: 'GOOGLE',
            providerId: profile.id,
            emailVerified: true, // Google emails are pre-verified
          });
        } else if (user.provider === 'LOCAL') {
          // Link Google account to existing local account
          user.providerId = profile.id;
          user.avatar = user.avatar || profile.photos?.[0]?.value;
          user.emailVerified = true;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);
```

### Google OAuth Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │  Google  │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │                     │
     │ Click "Sign in      │                     │                     │
     │ with Google"        │                     │                     │
     │                     │                     │                     │
     │ GET /auth/google    │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │                     │                     │
     │                     │ 302 Redirect to     │                     │
     │                     │ Google OAuth        │                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
     │ Redirect to Google  │                     │                     │
     │ consent screen      │                     │                     │
     │─────────────────────────────────────────▶│                     │
     │                     │                     │                     │
     │ User grants         │                     │                     │
     │ permission          │                     │                     │
     │                     │                     │                     │
     │ Redirect to callback│                     │                     │
     │ with auth code      │                     │                     │
     │◀─────────────────────────────────────────│                     │
     │                     │                     │                     │
     │ GET /auth/google/   │                     │                     │
     │ callback?code=xxx   │                     │                     │
     │────────────────────▶│                     │                     │
     │                     │                     │                     │
     │                     │ Exchange code for   │                     │
     │                     │ tokens              │                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │                     │ Get user profile    │                     │
     │                     │────────────────────▶│                     │
     │                     │◀────────────────────│                     │
     │                     │                     │                     │
     │                     │ Find/create user    │                     │
     │                     │─────────────────────────────────────────▶│
     │                     │◀─────────────────────────────────────────│
     │                     │                     │                     │
     │                     │ Generate JWT tokens │                     │
     │                     │                     │                     │
     │                     │ Create session      │                     │
     │                     │─────────────────────────────────────────▶│
     │                     │◀─────────────────────────────────────────│
     │                     │                     │                     │
     │ 302 Redirect to     │                     │                     │
     │ /auth/success       │                     │                     │
     │ + Set-Cookie        │                     │                     │
     │◀────────────────────│                     │                     │
     │                     │                     │                     │
```

### OAuth Routes Implementation

```typescript
// routes/auth.routes.ts

import { Router } from 'express';
import passport from 'passport';
import { generateTokens, createSession } from '../services/auth.service';

const router = Router();

// Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=oauth_failed',
  }),
  async (req, res) => {
    try {
      const user = req.user as User;
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Create session
      await createSession({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1/auth',
      });
      
      // Redirect to frontend with access token
      const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL);
      redirectUrl.searchParams.set('token', accessToken);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      res.redirect('/login?error=auth_failed');
    }
  }
);
```

### Frontend OAuth Handler

```typescript
// src/pages/AuthCallback.tsx

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, fetchUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      setAccessToken(token);
      fetchUser().then(() => navigate('/home'));
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setAccessToken, fetchUser]);

  return <div>Completing sign in...</div>;
};

export default AuthCallback;
```

---

## JWT Token Strategy

### Token Types

| Token         | Lifetime | Storage           | Purpose                    |
|---------------|----------|-------------------|----------------------------|
| Access Token  | 15 min   | Memory/State      | API authorization          |
| Refresh Token | 7 days   | HTTP-only cookie  | Obtain new access tokens   |

### Token Payload

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub: string;        // User ID
  email: string;
  type: 'access';
  iat: number;        // Issued at
  exp: number;        // Expiration
}

// Refresh Token Payload
interface RefreshTokenPayload {
  sub: string;        // User ID
  sessionId: string;  // Session ID for revocation
  type: 'refresh';
  iat: number;
  exp: number;
}
```

### Token Generation

```typescript
// services/token.service.ts

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: 'access',
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(user: User, sessionId: string): string {
  return jwt.sign(
    {
      sub: user.id,
      sessionId,
      type: 'refresh',
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}
```

### Token Refresh Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │ Database │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ Access token        │                     │
     │ expired (401)       │                     │
     │                     │                     │
     │ POST /refresh       │                     │
     │ Cookie: refreshToken│                     │
     │────────────────────▶│                     │
     │                     │                     │
     │                     │ Verify refresh token│
     │                     │                     │
     │                     │ Find session        │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ Validate session    │
     │                     │ not expired/revoked │
     │                     │                     │
     │                     │ Generate new        │
     │                     │ access token        │
     │                     │                     │
     │                     │ Rotate refresh token│
     │                     │ (optional)          │
     │                     │────────────────────▶│
     │                     │◀────────────────────│
     │                     │                     │
     │ 200 OK              │                     │
     │ {accessToken}       │                     │
     │ + Set-Cookie:       │                     │
     │   refreshToken (new)│                     │
     │◀────────────────────│                     │
     │                     │                     │
```

---

## Middleware

### Authentication Middleware

```typescript
// middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { User } from '../models';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required',
        },
      });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    
    // Optionally verify user still exists
    const user = await User.findById(payload.sub)
      .select('_id email')
      .lean();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User no longer exists',
        },
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        },
      });
    }
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid access token',
      },
    });
  }
}
```

### Rate Limiting

```typescript
// middleware/rateLimit.middleware.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ':' + req.body?.email;
  },
});

// Less strict for general endpoints
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## Security Considerations

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Security Headers

```typescript
// middleware/security.middleware.ts

import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet(),
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];
```

### Environment Variables

```env
# .env.example

# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/mindshift
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/mindshift?retryWrites=true&w=majority

# JWT Secrets (generate with: openssl rand -base64 64)
ACCESS_TOKEN_SECRET=your-access-token-secret-min-64-characters
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-64-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# Redis (for rate limiting & sessions)
REDIS_URL=redis://localhost:6379

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@mindshift.app
SMTP_PASS=your-smtp-password
```

---

## Frontend Integration

### Auth Context

```typescript
// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  setAccessToken: (token: string) => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    try {
      const { accessToken: newToken } = await authApi.refresh();
      setAccessToken(newToken);
      return newToken;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!accessToken) return;
    try {
      const userData = await authApi.getMe(accessToken);
      setUser(userData);
    } catch {
      await refreshAccessToken();
    }
  }, [accessToken, refreshAccessToken]);

  useEffect(() => {
    refreshAccessToken().finally(() => setIsLoading(false));
  }, [refreshAccessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchUser();
    }
  }, [accessToken, fetchUser]);

  const login = async (email: string, password: string) => {
    const { user, accessToken } = await authApi.login(email, password);
    setUser(user);
    setAccessToken(accessToken);
  };

  const register = async (email: string, password: string, name?: string) => {
    const { user, accessToken } = await authApi.register(email, password, name);
    setUser(user);
    setAccessToken(accessToken);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setAccessToken(null);
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        accessToken,
        login,
        register,
        logout,
        loginWithGoogle,
        setAccessToken,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### API Client with Token Refresh

```typescript
// src/services/apiClient.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Include cookies
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Request interceptor - add access token
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Prevent multiple refresh requests
      if (!refreshPromise) {
        refreshPromise = refreshToken();
      }
      
      const newToken = await refreshPromise;
      refreshPromise = null;
      
      if (newToken) {
        accessToken = newToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

async function refreshToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return response.data.data.accessToken;
  } catch {
    return null;
  }
}

export default apiClient;
```

---

## Error Codes

| Code                    | HTTP Status | Description                           |
|-------------------------|-------------|---------------------------------------|
| `VALIDATION_ERROR`      | 400         | Invalid input data                    |
| `INVALID_CREDENTIALS`   | 401         | Wrong email or password               |
| `UNAUTHORIZED`          | 401         | No access token provided              |
| `TOKEN_EXPIRED`         | 401         | Access token has expired              |
| `INVALID_TOKEN`         | 401         | Malformed or invalid token            |
| `USER_NOT_FOUND`        | 404         | User doesn't exist                    |
| `EMAIL_EXISTS`          | 409         | Email already registered              |
| `RATE_LIMITED`          | 429         | Too many requests                     |
| `INTERNAL_ERROR`        | 500         | Unexpected server error               |

---

## Testing

### Unit Test Example

```typescript
// __tests__/auth.service.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from '../services/auth.service';
import { generateAccessToken, verifyAccessToken } from '../services/token.service';

describe('Password Hashing', () => {
  it('should hash and verify password correctly', async () => {
    const password = 'SecureP@ssw0rd!';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('JWT Tokens', () => {
  const mockUser = { id: 'user123', email: 'test@example.com' };
  
  it('should generate and verify access token', () => {
    const token = generateAccessToken(mockUser);
    const payload = verifyAccessToken(token);
    
    expect(payload.sub).toBe(mockUser.id);
    expect(payload.email).toBe(mockUser.email);
    expect(payload.type).toBe('access');
  });
});
```

---

## Migration from Firebase

To migrate from the current Firebase authentication:

1. **Database Setup**: Set up MongoDB and create indexes
2. **User Migration**: Export Firebase users and import to MongoDB
3. **Update Frontend**: Replace Firebase SDK calls with new API client
4. **Environment**: Add new environment variables
5. **Testing**: Verify both auth flows work correctly
6. **Cleanup**: Remove Firebase auth dependencies

```bash
# Migration commands
npm uninstall firebase
npm install mongoose axios

# Start MongoDB locally (Docker)
docker run -d --name mindshift-mongo -p 27017:27017 mongo:7

# Or use MongoDB Atlas (cloud) - get connection string from dashboard
```

---

## Checklist

- [ ] Set up MongoDB database (local or Atlas)
- [ ] Create Mongoose models and indexes
- [ ] Implement Node.js auth routes
- [ ] Configure Passport.js with Google strategy
- [ ] Set up JWT token generation and validation
- [ ] Implement rate limiting with Redis
- [ ] Update frontend AuthContext
- [ ] Add OAuth callback page
- [ ] Configure CORS and security headers
- [ ] Set up email service for password reset
- [ ] Write unit and integration tests
- [ ] Update environment variables in all environments
- [ ] Remove Firebase auth dependencies
