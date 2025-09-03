# One-to-One Chat Application 💬

A modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for instant messaging with local file sharing capabilities.

![Chat App](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features Overview

### 🔐 Authentication & Security

- **JWT-based Authentication**: Secure login/register system
- **Password Encryption**: bcryptjs hashing for user passwords
- **Protected Routes**: Middleware authentication for secure endpoints
- **Token Management**: Automatic token refresh and validation

### 💬 Real-time Messaging

- **Instant Delivery**: Socket.IO for real-time message delivery
- **Typing Indicators**: See when users are typing in real-time
- **Read Receipts**: Message status tracking (sent ✓, delivered ✓✓, read ✓✓)
- **Online Status**: Real-time user online/offline status updates
- **Message Persistence**: All conversations saved in MongoDB

### � Local File Sharing System

- **📸 Image Sharing**: Inline image previews and full-size viewing
- **🎥 Video Sharing**: Embedded video player with controls
- **🎵 Audio Sharing**: Built-in audio player for music files
- **📄 Document Sharing**: Support for PDF, Word, Excel, PowerPoint
- **📦 Universal Support**: Handle any file type with download capability
- **💾 Local Storage**: No cloud dependencies - files stored on server
- **🗂️ Smart Organization**: Automatic file categorization by type
- **📊 Size Limits**: Configurable file size limits (default 50MB)

### 🎨 Modern UI/UX

- **📱 Responsive Design**: Mobile-first Bootstrap-based interface
- **🌟 Smooth Animations**: Elegant message transitions and loading states
- **🔔 Smart Notifications**: Toast notifications for new messages
- **⚡ Optimized Performance**: Efficient scroll handling and message loading
- **🎯 Intuitive Interface**: Clean, user-friendly chat experience

## 🛠️ Tech Stack

### Backend Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for message and user storage
- **Mongoose** - MongoDB object modeling for Node.js
- **Socket.IO** - Real-time bidirectional event-based communication
- **Multer** - Node.js middleware for handling multipart/form-data (file uploads)
- **JWT (jsonwebtoken)** - JSON Web Token implementation
- **bcryptjs** - Password hashing library
- **CORS** - Cross-Origin Resource Sharing middleware
- **dotenv** - Environment variable management
- **fs-extra** - File system operations with extra methods
- **mime-types** - MIME type detection for uploaded files

### Frontend Technologies

- **React** - JavaScript library for building user interfaces
- **React Router DOM** - Declarative routing for React
- **React Bootstrap** - Bootstrap components for React
- **Socket.IO Client** - Client-side Socket.IO implementation
- **Axios** - Promise-based HTTP client
- **React Dropzone** - Drag & drop file upload component
- **File Saver** - Client-side file downloading utility
- **React Hot Toast** - Beautiful toast notifications
- **Moment.js** - Date parsing, validation, manipulation, and formatting

### Development Tools

- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run multiple npm commands simultaneously
- **VS Code Tasks** - Integrated development commands

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v14.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas) - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### 1. 📥 Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd one_to_one_chat_app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. 🔧 Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/chatapp
# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration (optional)
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_PATH=./uploads
```

### 3. 🗄️ Database Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# The application will create collections automatically
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 4. 🎯 Run the Application

**Option A: Development Mode (Recommended)**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Option B: Using VS Code Tasks**

```bash
# Open VS Code in project root
# Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# Type "Tasks: Run Task"
# Select "Start Backend" and "Start Frontend"
```

### 5. 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **File Downloads**: http://localhost:5000/api/files/download/:filename

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Chat Routes

- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:userId` - Get messages with specific user
- `POST /api/chat/send` - Send a message
- `PUT /api/chat/read/:conversationId` - Mark messages as read

### User Routes

- `GET /api/users` - Get all users
- `GET /api/users/search` - Search users
- `GET /api/users/:userId` - Get user by ID

## Socket Events

### Client Events (Emit)

- `sendMessage` - Send a new message
- `joinConversation` - Join a conversation room
- `leaveConversation` - Leave a conversation room
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read
- `getOnlineUsers` - Request online users list

### Server Events (Listen)

- `newMessage` - Receive new message
- `messageSent` - Message sent confirmation
- `messageError` - Message sending error
- `userOnline` - User came online
- `userOffline` - User went offline
- `userTyping` - User typing indicator
- `messagesRead` - Messages read receipt
- `onlineUsers` - List of online users

## Project Structure

````
one_to_one_chat_app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   └── Chat/
│   │   │       ├── Chat.js
│   │   │       ├── Sidebar.js
│   │   │       ├── ChatWindow.js
│   │   │       └── Chat.css
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
└── # One-to-One Chat App with Local File Storage

A modern real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO, featuring local file storage capabilities.

## Features

### Core Features
- 🔐 **Authentication**: User registration and login with JWT tokens
- 💬 **Real-time Messaging**: Instant messaging using Socket.IO
- 👥 **User Management**: Online/offline status, user lists
- 📁 **Local File Sharing**: Upload and share files locally (no cloud storage)
- 📱 **Responsive UI**: Modern Bootstrap-based interface
- ⚡ **Typing Indicators**: See when users are typing
- ✓ **Read Receipts**: Know when messages are read

### File Sharing Features
- 📸 **Image Sharing**: View images inline with preview
- 🎥 **Video Sharing**: Play videos directly in chat
- 🎵 **Audio Sharing**: Play audio files in chat
- 📄 **Document Sharing**: Download PDF, Word, Excel files
- 📦 **Any File Type**: Support for all file types
- 💾 **Local Storage**: Files stored locally on server (no cloud dependencies)
- 📊 **File Size Limit**: 100MB per file
- 🗂️ **Organized Storage**: Files organized by category in folders

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Bootstrap** - UI components
- **Socket.IO Client** - Real-time client
- **Axios** - HTTP requests
- **React Dropzone** - File upload UI
- **File Saver** - File download utility
- **Moment.js** - Date formatting

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd one_to_one_chat_app
````

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in a new terminal)
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 File Sharing System

### Supported File Types

| Category      | File Types                           | Max Size | Features                          |
| ------------- | ------------------------------------ | -------- | --------------------------------- |
| **Images**    | JPG, PNG, GIF, WEBP, BMP, SVG        | 50MB     | Inline preview, full-size modal   |
| **Videos**    | MP4, AVI, MOV, WMV, FLV, WEBM        | 50MB     | Embedded player with controls     |
| **Audio**     | MP3, WAV, OGG, FLAC, AAC             | 50MB     | Built-in audio player             |
| **Documents** | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX | 50MB     | Download with file info           |
| **Others**    | Any file type                        | 50MB     | Download with mime-type detection |

### File Storage Structure

```
backend/uploads/
├── images/          # Image files with thumbnails
├── videos/          # Video files
├── audio/           # Audio files
├── documents/       # PDF, Office documents
└── others/          # All other file types
```

### Upload Process

1. **Drag & Drop**: Simply drag files into chat window
2. **File Picker**: Click attachment button to browse files
3. **Validation**: Automatic file type and size validation
4. **Upload**: Secure multipart upload to server
5. **Storage**: Files organized by category automatically
6. **Notification**: Real-time notification to recipient
7. **Preview**: Immediate preview in chat interface

### File Message Features

- **Smart Previews**: Different UI for each file type
- **Download Options**: One-click download for all files
- **File Information**: Size, type, upload date display
- **Delete Option**: Senders can delete their uploaded files
- **Mobile Optimized**: Touch-friendly file interaction

## 🔌 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Chat Endpoints

#### Get Conversations

```http
GET /api/chat/conversations
Authorization: Bearer <jwt_token>
```

#### Get Messages

```http
GET /api/chat/messages/:userId
Authorization: Bearer <jwt_token>
```

### File Endpoints

#### Upload File

```http
POST /api/files/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- file: <file_binary>
- receiverId: <user_id>
```

#### Download File

```http
GET /api/files/download/:filename
```

#### Get File Info

```http
GET /api/files/info/:filename
Authorization: Bearer <jwt_token>
```

#### Delete File

```http
DELETE /api/files/delete/:messageId
Authorization: Bearer <jwt_token>
```

### User Endpoints

#### Get All Users

```http
GET /api/users
Authorization: Bearer <jwt_token>
```

## Socket Events

### Client to Server

- `sendMessage` - Send text message
- `joinConversation` - Join conversation room
- `leaveConversation` - Leave conversation room
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read

### Server to Client

- `newMessage` - Receive new message
- `messageSent` - Message sent confirmation
- `messageError` - Message sending error
- `userTyping` - User typing notification
- `userOnline`/`userOffline` - User status updates
- `messagesRead` - Messages read receipt

## File Upload Process

1. **Frontend**: User selects files using drag & drop or file picker
2. **Validation**: File size and type validation on frontend
3. **Upload**: Files sent to backend via multipart/form-data
4. **Storage**: Backend saves files to appropriate category folder
5. **Database**: File metadata stored in MongoDB
6. **Notification**: Socket event sent to notify recipient
7. **Display**: Files displayed in chat with appropriate previews

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- File type validation
- File size limits
- Input sanitization
- Protected routes

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.

## Roadmap

Future enhancements:

- [ ] Group chat functionality
- [ ] Voice/video calling
- [ ] Message reactions
- [ ] Message search
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] File encryption
- [ ] Message scheduling.md

````

## Key Features Implementation

### Real-time Communication

The app uses Socket.IO for real-time bidirectional communication between client and server. Key implementations include:

- **Connection Management**: Automatic user authentication via JWT tokens
- **Room Management**: Dynamic conversation rooms for private messaging
- **Event Handling**: Comprehensive event system for messaging, typing, and status updates

### Message Management

- **Persistence**: All messages are stored in MongoDB
- **Status Tracking**: Messages have sent, delivered, and read status
- **Optimistic Updates**: UI updates immediately with temporary messages

### User Experience

- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Indicators**: Typing indicators and online status
- **Intuitive UI**: Clean interface with smooth animations

## Development

### Running in Development Mode

1. Start MongoDB service
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm start`
4. Visit `http://localhost:3000`

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# The backend can serve the built React app
````

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- [ ] File and image sharing
- [ ] Message reactions and replies
- [ ] User blocking and reporting
- [ ] Message encryption
- [ ] Group chat functionality
- [ ] Voice and video calling
- [ ] Message search functionality
- [ ] Dark/light theme toggle
- [ ] Push notifications
- [ ] Message deletion and editing

## 🔧 Troubleshooting & FAQ

### Common Setup Issues

#### 1. MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

- Ensure MongoDB is installed and running
- Check `MONGODB_URI` in `.env` file
- For Windows: Start MongoDB as a service
- For macOS: `brew services start mongodb-community`
- For Linux: `sudo systemctl start mongod`

#### 2. Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solutions:**

- Kill process using port: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)
- Or change PORT in `.env` file
- For Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

#### 3. File Upload Errors

```
Error: File too large or LIMIT_FILE_SIZE
```

**Solutions:**

- Check file size (default limit: 50MB)
- Verify `uploads/` directory exists and has write permissions
- Ensure all subdirectories exist: `images/`, `videos/`, `audio/`, `documents/`, `others/`

#### 4. Socket Connection Failed

```
Error: WebSocket connection failed
```

**Solutions:**

- Verify backend server is running on correct port
- Check firewall settings
- Ensure CORS is properly configured
- Try refreshing the page

### Development Tips

#### Hot Reload Issues

- If changes aren't reflecting, try:
  - Clear browser cache (Ctrl+Shift+R)
  - Restart development servers
  - Check for console errors

#### Database Reset

```bash
# Connect to MongoDB shell
mongo
# Drop the database
use chatapp
db.dropDatabase()
```

#### File Cleanup

```bash
# Remove all uploaded files
rm -rf backend/uploads/*
# Recreate directory structure
mkdir -p backend/uploads/{images,videos,audio,documents,others}
```

### Performance Optimization

#### For Large File Uploads

- Increase `MAX_FILE_SIZE` in `.env`
- Consider implementing chunked uploads for files > 100MB
- Add progress indicators for large uploads

#### For Many Concurrent Users

- Implement connection pooling for MongoDB
- Consider Redis for session storage
- Add rate limiting to prevent spam

### FAQ

**Q: Can I change the file size limit?**
A: Yes, modify `MAX_FILE_SIZE` in `.env` and restart the server.

**Q: How do I add new file types?**
A: File types are automatically detected. New types go to the "others" category.

**Q: Can I deploy this to production?**
A: Yes, but ensure:

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable HTTPS
- Use MongoDB Atlas or secured MongoDB instance
- Set up proper file backup strategy

**Q: How do I customize the UI theme?**
A: Modify the Bootstrap variables in `BootstrapChat.css` or create custom themes.

**Q: Is this secure for production use?**
A: Basic security is implemented, but consider adding:

- Rate limiting
- Input sanitization
- File virus scanning
- HTTPS enforcement
- Database encryption

## 🤝 Contributing

We welcome contributions to improve the chat application! Here's how you can help:

### Development Process

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** with clear, descriptive commits
5. **Test your changes** thoroughly
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Submit a Pull Request** with a clear description

### Code Style Guidelines

- Use ESLint and Prettier for consistent formatting
- Follow React best practices and hooks patterns
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

### Areas for Contribution

- 🐛 Bug fixes and improvements
- ✨ New features (group chat, voice calling, etc.)
- 🎨 UI/UX improvements
- 📚 Documentation updates
- 🧪 Test coverage improvements
- 🚀 Performance optimizations

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 One-to-One Chat App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🗺️ Roadmap & Future Features

### Version 2.1 (Next Release)

- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🌙 Dark/Light theme toggle
- [ ] 🔍 Message search functionality
- [ ] 📌 Message pinning
- [ ] 🏷️ Message tags and categories

### Version 2.5 (Medium Term)

- [ ] 👥 Group chat functionality
- [ ] 🎤 Voice message recording
- [ ] 📞 Voice calling integration
- [ ] 📹 Video calling support
- [ ] 😀 Message reactions and emojis
- [ ] 📱 Mobile app (React Native)

### Version 3.0 (Long Term)

- [ ] 🔐 End-to-end encryption
- [ ] 🌐 Multi-language support
- [ ] 📊 Chat analytics and insights
- [ ] 🤖 AI-powered chat features
- [ ] ☁️ Cloud storage integration
- [ ] 🔔 Advanced notification system

## 📞 Support & Contact

### Getting Help

- 📖 **Documentation**: Check this README first
- 🐛 **Issues**: [Create an issue](https://github.com/your-repo/issues) on GitHub
- 💬 **Discussions**: [Join discussions](https://github.com/your-repo/discussions) for questions
- 📧 **Email**: contact@example.com for direct support

### Community

- 💭 Join our [Discord Server](#) for real-time help
- 🐦 Follow us on [Twitter](#) for updates
- 📺 [YouTube tutorials](#) and walkthroughs

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Built with ❤️ by the development team**

[🔝 Back to Top](#-one-to-one-chat-application)

</div>
