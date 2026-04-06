# Locator Backend

REST API backend for the Locator employee attendance and location tracking system. Built with Express.js and MongoDB.

## Features

- **Authentication** - JWT-based signup/login with biometric authentication support
- **Attendance Tracking** - GPS-based check-in/check-out with address logging
- **Device Management** - Track and store device information per user
- **Admin Dashboard** - User stats, attendance history, and Excel data export
- **Role-Based Access** - User and Admin roles with middleware protection

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + bcrypt
- **Deployment:** Vercel

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login with credentials | No |
| POST | `/logout` | Logout user | No |
| POST | `/biometric-login` | Login via biometric | No |
| GET | `/biometric-status` | Check biometric setting | Yes |
| PUT | `/biometric-status` | Toggle biometric | Yes |
| PUT | `/upload-profile-image` | Upload profile picture | Yes |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/today` | Get today's attendance | Yes |
| POST | `/checkin` | Check in with location | Yes |
| POST | `/checkout` | Check out with location | Yes |

### Device (`/api`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/saveDeviceInfo` | Save device info | Yes |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Dashboard statistics | Admin |
| GET | `/users` | List all users | Admin |
| GET | `/users/:userId` | User details + history | Admin |
| GET | `/export-users` | Export users as Excel | Admin |

## Data Models

### User
- `username`, `email`, `password` (hashed)
- `role` (user/admin)
- `biometricEnabled`, `profileImage`

### Attendance
- `userId`, `date` (YYYY-MM-DD)
- `checkinTime`, `checkoutTime`
- `checkinLocation` / `checkoutLocation` (lat, lng, address)
- `totalHours`, `isActive`

### Device
- `userId`, `brand`, `manufacturer`, `modelName`
- `osName`, `osVersion`, `totalMemory`
- Unique constraint on `(userId, deviceName)`

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
cd Locator-Backend
npm install
```

### Environment Variables

Create a `.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Locator
PORT=5000
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Ensure MongoDB Atlas allows connections from `0.0.0.0/0` (required for serverless)

## Project Structure

```
Locator-Backend/
  config/
    db.js              # MongoDB connection
  middleware/
    authMiddleware.js   # JWT auth middleware
  models/
    userModel.js        # User schema
    attendanceModel.js  # Attendance schema
    deviceModel.js      # Device schema
  routes/
    authRoutes.js       # Auth endpoints
    attendanceRoutes.js # Attendance endpoints
    deviceRoutes.js     # Device endpoints
    adminRoutes.js      # Admin endpoints
  scripts/
    cleanupDuplicateDevices.js
    fixCorrectDatabase.js
    testAdminAPI.js
  server.js             # Entry point
  vercel.json           # Vercel config
```
