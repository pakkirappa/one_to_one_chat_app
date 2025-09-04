# One-to-One Chat App

Real-time chat application with file sharing built using the MERN stack and Socket.IO.

## Tech Stack

**Backend:**

- Node.js & Express.js - Server and API
- MongoDB & Mongoose - Database
- Socket.IO - Real-time messaging
- JWT - Authentication
- Multer - File uploads
- bcryptjs - Password hashing

**Frontend:**

- React - UI framework
- React Bootstrap - UI components
- Socket.IO Client - Real-time communication
- Axios - HTTP requests
- React Dropzone - File uploads
- File Saver - File downloads

## Project Structure

```
one_to_one_chat_app/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema and model
│   │   └── Message.js        # Message schema with file support
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── chat.js           # Chat message endpoints
│   │   ├── users.js          # User management endpoints
│   │   └── files.js          # File upload/download endpoints
│   ├── socket/
│   │   └── socketHandler.js  # Socket.IO event handling
│   ├── uploads/              # Local file storage
│   │   ├── images/
│   │   ├── documents/
│   ├── server.js             # Express server setup
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   │   ├── Login.js
    │   │   │   └── Register.js
    │   │   └── Chat/
    │   │       ├── Chat.js       # Main chat container
    │   │       ├── ChatWindow.js # Message display and input
    │   │       ├── FileUpload.js # File drag & drop component
    │   │       ├── FileMessage.js # File message display
    │   │       └── BootstrapChat.css
    │   ├── contexts/
    │   │   ├── AuthContext.js    # Authentication state
    │   │   └── SocketContext.js  # Socket connection state
    │   ├── App.js
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- Git

## Quick Start

1. **Clone repository:**

   ```bash
   git clone <repository-url>
   cd one_to_one_chat_app
   ```

2. **Setup backend:**

   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` file in backend directory:**

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

4. **Setup frontend:**

   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the application:**

   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

6. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Features

- Real-time messaging with Socket.IO
- JWT authentication
- File sharing (images, documents)
- Responsive Bootstrap UI
- Online/offline status
- Typing indicators

## File Storage

Files are stored locally in `backend/uploads/` organized by category:

- `images/` - JPG, PNG, GIF, etc.
- `documents/` - PDF, DOC, XLS, etc.

