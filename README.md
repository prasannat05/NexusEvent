# NexusEvent

A modern, full-stack event management platform designed for campus communities to create, discover, and register for events with intuitive user interface and role-based access control.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [Security](#security)

---

## Overview

NexusEvent provides a comprehensive platform for managing campus events efficiently. The application delivers a responsive and user-friendly experience for event organizers, attendees, and administrators through a modern web interface and robust backend infrastructure.

**Project ID**: 1302398797  
**Primary Language**: JavaScript (53.4%), CSS (46.3%), HTML (0.3%)

---

## Features

### User Roles and Permissions

- **Students**: View events, register for events, manage tickets, cancel registrations
- **Organizers**: Create events, manage created events, submit organizer upgrade requests
- **Admins**: Approve organizer requests, manage users, system administration

### Core Functionality

- User authentication with Firebase Authentication
- Event creation and management
- Real-time event discovery and filtering
- Secure event registration with capacity management
- Unique ticket generation with passId system
- Organizer request approval workflow
- Role-based access control
- User profile management
- Health check monitoring

---

## Technology Stack

### Frontend

- **Framework**: React 19.2.7
- **Router**: React Router DOM 7.18.1
- **Build Tool**: Vite 8.1.1
- **Language**: TypeScript 6.0.2
- **HTTP Client**: Axios 1.18.1
- **Authentication**: Firebase SDK 12.16.0
- **Styling**: CSS3

### Backend (Express Option)

- **Runtime**: Node.js
- **Framework**: Express 4.21.0
- **Database**: MongoDB 8.8.0 (via Mongoose)
- **Auth**: Firebase Admin SDK 12.6.0
- **Middleware**: CORS 2.8.5, dotenv 16.4.5

### Backend (Firebase Cloud Functions Option)

- **Runtime**: Firebase Functions v2
- **Framework**: Express 4.21.0
- **Database**: MongoDB 8.8.0 (via Mongoose)
- **Auth**: Firebase Admin SDK 12.6.0

### Infrastructure

- **Database**: MongoDB Atlas (cloud-hosted)
- **Frontend Hosting**: Firebase Hosting
- **Backend Option 1**: Render.com
- **Backend Option 2**: Firebase Cloud Functions
- **Authentication**: Firebase Authentication

---

## Project Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              Firebase Hosting / Vite Dev                 │
└─────────────────┬───────────────────────────────────────┘
                  │ Axios / REST API
┌─────────────────▼───────────────────────────────────────┐
│                  Backend (Express)                       │
│          Render OR Firebase Cloud Functions              │
└─────────────────┬───────────────────────────────────────┘
                  │ Mongoose / MongoDB Driver
┌─────────────────▼───────────────────────────────────────┐
│             Database (MongoDB Atlas)                     │
│              nexuscampus_db / NexusCampus                │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User enters credentials on LoginPage
2. Firebase Authentication validates credentials
3. Firebase returns ID Token
4. Token stored in client-side context
5. Token sent in Authorization header (Bearer scheme)
6. Backend verifies token using Firebase Admin SDK
7. Decoded user info attached to request object
8. Protected routes enforce token verification
```

---

## Getting Started

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB)
- Firebase project with authentication enabled
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/prasannat05/NexusEvent.git
cd NexusEvent
```

#### 2. Setup Frontend

```bash
cd client
npm install
```

#### 3. Setup Backend (Express Server)

```bash
cd ../server
npm install
```

#### 4. Environment Configuration

Create `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@nexuscampus.uq1tlkh.mongodb.net/nexuscampus_db?retryWrites=true&w=majority
NODE_ENV=development
```

For Firebase Cloud Functions, update `functions/index.js` with your MongoDB URI.

### Development

#### Run Frontend

```bash
cd client
npm run dev          # Starts Vite server on http://localhost:5173
```

#### Run Backend

```bash
cd server
npm run dev          # Starts Express server on http://localhost:5000
```

The frontend Vite configuration automatically proxies `/api` requests to `http://localhost:5000`.

### Build for Production

#### Frontend Build

```bash
cd client
npm run build        # Produces optimized build in dist/
npm run preview      # Preview production build locally
```

#### Backend is Ready for Deployment

The Express server is production-ready. No build step required.

---

## API Documentation

### Authentication Endpoints

#### Register / Update User

```http
POST /api/auth/register
Authorization: Bearer <id_token>
Content-Type: application/json

{
  "role": "student",
  "displayName": "John Doe"
}
```

**Response** (200):
```json
{
  "message": "User registered",
  "user": {
    "_id": "ObjectId",
    "uid": "firebase_uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "student",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <id_token>
```

**Response** (200):
```json
{
  "_id": "ObjectId",
  "uid": "firebase_uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "student",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Event Endpoints

#### List All Events

```http
GET /api/events
```

**Response** (200):
```json
[
  {
    "_id": "ObjectId",
    "title": "Campus Hackathon 2024",
    "date": "2024-02-20T09:00:00Z",
    "location": "Building A, Room 101",
    "maxCapacity": 100,
    "attendees": ["uid1", "uid2"],
    "createdBy": "organizer_uid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Event Details

```http
GET /api/events/:id
```

#### Create Event

```http
POST /api/events
Authorization: Bearer <id_token>
Content-Type: application/json

{
  "title": "Campus Hackathon 2024",
  "date": "2024-02-20T09:00:00Z",
  "location": "Building A, Room 101",
  "maxCapacity": 100
}
```

**Response** (201):
```json
{
  "message": "Event created",
  "event": {
    "_id": "ObjectId",
    "title": "Campus Hackathon 2024",
    "date": "2024-02-20T09:00:00Z",
    "location": "Building A, Room 101",
    "maxCapacity": 100,
    "attendees": [],
    "createdBy": "organizer_uid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Delete Event

```http
DELETE /api/events/:id
Authorization: Bearer <id_token>
```

### Ticket Endpoints

#### Register for Event

```http
POST /api/tickets/register/:eventId
Authorization: Bearer <id_token>
```

**Response** (201):
```json
{
  "message": "Registration successful",
  "ticket": {
    "_id": "ObjectId",
    "userId": "user_uid",
    "eventId": "event_id",
    "passId": "CAMPUS-ABC123-XYZ789",
    "status": "confirmed",
    "registeredAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Cancel Event Registration

```http
DELETE /api/tickets/cancel/:eventId
Authorization: Bearer <id_token>
```

#### Get User Tickets

```http
GET /api/tickets/my
Authorization: Bearer <id_token>
```

### System Endpoints

#### Health Check

```http
GET /api/health
```

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  uid: String (unique),           // Firebase UID
  email: String (unique),
  displayName: String,
  role: String (enum: ['student', 'organizer', 'admin']),
  createdAt: Date (default: now)
}
```

### Event Collection

```javascript
{
  _id: ObjectId,
  title: String (required, trimmed),
  date: Date (required),
  location: String (required, trimmed),
  maxCapacity: Number (required, min: 1),
  attendees: [String],           // Array of user UIDs
  createdBy: String (required),  // Organizer UID
  createdAt: Date (default: now)
}
```

### Ticket Collection

```javascript
{
  _id: ObjectId,
  userId: String (required),
  eventId: ObjectId (ref: Event, required),
  passId: String (unique),       // Format: CAMPUS-{eventId}-{timestamp}
  status: String (enum: ['confirmed', 'cancelled'], default: 'confirmed'),
  registeredAt: Date (default: now),
  Index: { userId: 1, eventId: 1 } (unique)
}
```

### OrganizerRequest Collection

```javascript
{
  _id: ObjectId,
  userId: String (unique),
  email: String,
  status: String (enum: ['pending', 'approved', 'rejected']),
  requestedAt: Date (default: now),
  reviewedAt: Date (optional)
}
```

---

## Deployment

### Firebase Hosting (Frontend)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Build the client:
   ```bash
   cd client && npm run build
   ```

3. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

### Render (Backend)

1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables (MONGODB_URI, PORT)
4. Deploy automatically from main branch

**Render Configuration** (render.yaml already provided):
- Runtime: Node
- Build Command: `npm install`
- Start Command: `node server.js`
- Root Directory: `server`

### Firebase Cloud Functions (Alternative Backend)

1. Configure Firebase project
2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

3. Update frontend API endpoint to your Cloud Function URL

### CORS Configuration

The backend accepts requests from:
- https://nexuscampus-pras.web.app
- https://nexuscampus-pras.firebaseapp.com
- http://localhost:5173 (development)
- http://localhost:5174 (development)

---

## Development Guide

### Project Structure

```
NexusEvent/
├── client/                           # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   │   └── Sidebar.jsx          # Navigation sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── TicketsPage.jsx
│   │   │   ├── OrganizerPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── firebase.js             # Firebase config
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                           # Express Backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Ticket.js
│   │   └── OrganizerRequest.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── requestRoutes.js
│   ├── server.js                   # Express app entry
│   ├── package.json
│   └── .env.example
│
├── functions/                        # Firebase Cloud Functions
│   ├── index.js
│   └── package.json
│
├── firebase.json
├── render.yaml
├── .firebaserc
└── README.md
```

### Frontend Development

#### Creating a New Page

1. Create component in `client/src/pages/`
2. Import in `App.jsx`
3. Add route in Routes configuration
4. Implement authentication check if needed

#### Using Authentication Context

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not authenticated</p>;

  return <div>Welcome, {user.displayName}</div>;
}
```

#### Making API Calls

```javascript
import { apiClient } from './services/api';

async function fetchEvents() {
  try {
    const response = await apiClient.get('/events');
    setEvents(response.data);
  } catch (error) {
    console.error('Failed to fetch events', error);
  }
}
```

### Backend Development

#### Creating a New Model

1. Create file in `server/models/`
2. Define Mongoose schema
3. Export model

#### Creating a New Route

1. Create router file in `server/routes/`
2. Define endpoints with middleware
3. Import and mount in `server.js`

#### Adding Authentication to Routes

```javascript
router.post('/protected-endpoint', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  // Handler logic
});
```

---

## Security

### Current Implementation

- Firebase Authentication for secure user identity
- Bearer token verification on protected endpoints
- CORS configured for specific origins
- Unique constraints prevent duplicate registrations
- MongoDB schema validation

### Security Considerations

- Never commit `.env` files
- Keep MongoDB URI in environment variables
- Rotate Firebase credentials regularly
- Validate all user inputs on backend
- Implement rate limiting for production
- Use HTTPS in production (Firebase Hosting handles this)
- Consider adding request logging and monitoring
- Implement request timeouts on Cloud Functions

### Recommended Enhancements

- Implement request rate limiting
- Add comprehensive error logging
- Enable MongoDB encryption at rest
- Add input sanitization
- Implement API request validation with Joi or Zod
- Add brute-force protection for login attempts

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

---

## Troubleshooting

### MongoDB Connection Issues

- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct
- Verify network connectivity

### Firebase Authentication Errors

- Check Firebase project ID matches config
- Verify Firebase credentials are valid
- Ensure Firebase project has Authentication enabled
- Check CORS configuration

### CORS Errors

- Verify frontend URL is in CORS allowed origins
- Check request includes proper headers
- Verify backend is running and accessible

---

## Browser Compatibility

Supported browsers:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

This project is provided as-is for educational and demonstration purposes.

---

## Project Information

- **Repository**: https://github.com/prasannat05/NexusEvent
- **Firebase Project**: nexuscampus-pras
- **MongoDB Project**: NexusCampus
- **Primary Language**: JavaScript
- **Status**: Active Development

---

## Contact and Support

For issues, feature requests, or questions regarding NexusEvent, please open an issue in the GitHub repository or contact the project maintainer.

---

**Last Updated**: January 2024  
**Version**: 1.0.0
