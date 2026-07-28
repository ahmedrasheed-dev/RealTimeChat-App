# RealTimeChat (Snapit)

A full-stack, real-time messaging application built with React, TypeScript, Node.js, Express, Socket.io, and MongoDB.

🔗 **Live Demo:** [https://real-time-chat-app-nu-wine.vercel.app/](https://real-time-chat-app-nu-wine.vercel.app/)

---

## Features

- **Real-Time Messaging**: Instant 1-on-1 messaging using WebSockets (`socket.io`).
- **Online Presence**: Live online/offline status indicators for connected users.
- **Authentication**: JWT-based auth with password hashing (`bcryptjs`) and session persistence.
- **Media Uploads**: Image attachment support powered by Cloudinary API.
- **Unread Counters**: Real-time unread message counts and dynamic read receipts.
- **Profile Management**: Customizable user profile picture and bio updates.
---

## Tech Stack

### Frontend (`/client`)
- **Framework**: React + TypeScript
- **Real-time Client**: Socket.io Client


### Backend (`/server`)
- **Runtime**: Node.js + Express v5
- **Language**: TypeScript
- **Database**: MongoDB
- **Real-time Engine**: Socket.io
- **Media Storage**: Cloudinary SDK
- **Security**: JWT & bcryptjs

---


## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or local MongoDB instance
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/ahmedrasheed-dev/RealTimeChat-App.git
cd RealTimeChat-App-TS
```

### 2. Configure Environment Variables

Create `.env` in the `server/` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

Create `.env` in the `client/` directory:
```env
VITE_BACKEND_URL=http://localhost:3000
```

### 3. Install Dependencies & Start

**Start Backend Server:**
```bash
cd server
npm install
npm run dev
```

**Start Frontend Client:**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deployment Architecture

- **Frontend**: Hosted on [Vercel](https://vercel.com/) (Single Page Application rewrite configured via `vercel.json`).
- **Backend**: Deployed on [Render](https://render.com/) (Persistent WebSockets support for Socket.io).
- **Database**: Hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Storage**: Hosted on [Cloudinary](https://cloudinary.com/).

---

## License

Distributed under the ISC License.
