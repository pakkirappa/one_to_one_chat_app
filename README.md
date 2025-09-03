# One-to-One Chat Application with File Sharing

## � Project Overview for Interviewers

This project demonstrates my ability to build a full-stack JavaScript application using modern technologies and best practices. It's a real-time chat application with file sharing capabilities, built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO.

![Chat App](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

### 🎯 Key Technical Highlights

- **Full-Stack Development**: Complete end-to-end application with well-structured front and back-end code
- **Real-Time Communication**: Implemented Socket.IO for instant messaging and status updates
- **State Management**: Used React Context API for global state management
- **Authentication**: JWT-based authentication with secure password handling
- **File Handling**: Complete file upload/download system with proper categorization
- **Responsive Design**: Mobile-first approach using React Bootstrap
- **API Design**: RESTful API architecture with proper error handling

## 🛠️ Technical Implementation

### Architecture

```
Client (React) <---> Server (Express/Node.js) <---> Database (MongoDB)
            ↑           ↑
            └───Socket.IO───┘
```

### Backend Technologies

- **Node.js & Express**: Server framework and API implementation
- **MongoDB & Mongoose**: Data persistence and modeling
- **Socket.IO**: Real-time bidirectional event-based communication
- **JWT**: Authentication mechanism
- **Multer**: File upload handling with proper validation and storage
- **bcryptjs**: Password hashing for security

### Frontend Technologies

- **React**: Component-based UI development
- **React Bootstrap**: Responsive UI components
- **Socket.IO Client**: Real-time communication with server
- **Context API**: Global state management solution
- **Axios**: HTTP client for API calls
- **Moment.js**: Date formatting and manipulation

## 💡 Technical Challenges & Solutions

### Challenge 1: Real-Time Messaging

**Solution**: Implemented Socket.IO with room-based message delivery and proper event handling. The architecture ensures messages are delivered instantly while also being stored in the database for persistence.

```javascript
// socketHandler.js
socket.on("sendMessage", async (messageData) => {
  try {
    // Save message to database
    const newMessage = await Message.create({
      sender: messageData.sender,
      receiver: messageData.receiver,
      content: messageData.content,
      messageType: messageData.messageType || "text",
      fileInfo: messageData.fileInfo,
    });

    // Emit to specific conversation room
    io.to(getConversationRoom(messageData.sender, messageData.receiver)).emit(
      "newMessage",
      newMessage
    );

    // Update conversation last message
    await updateConversation(messageData);
  } catch (error) {
    socket.emit("messageError", { error: error.message });
  }
});
```

### Challenge 2: File Sharing System

**Solution**: Created a comprehensive file handling system that:

- Validates file types and sizes
- Organizes files by category (images, videos, audio, documents, etc.)
- Generates appropriate UI for each file type
- Handles downloads securely

```javascript
// fileUpload.js middleware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = getFileCategory(file.mimetype);
    const dir = path.join(__dirname, `../uploads/${category}`);
    fs.ensureDirSync(dir); // Create directory if it doesn't exist
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

// File size and type validation
const fileFilter = (req, file, cb) => {
  // Implementation of file validation logic
};
```

### Challenge 3: Authentication & User Management

**Solution**: Implemented a secure JWT-based authentication system with proper token management, password hashing, and protected routes.

```javascript
// auth.js middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};
```

## 🧠 Design Decisions & Trade-offs

### 1. Local File Storage vs. Cloud Storage

**Decision**: Used local server storage for files instead of cloud services like AWS S3.

**Reasoning**:

- Simplified implementation for demonstration purposes
- Reduced external dependencies
- Complete control over the file handling process

**Trade-offs**:

- Scalability limitations (would use S3 in production)
- No CDN for faster file delivery
- Server disk space constraints

### 2. React Context vs. Redux

**Decision**: Used React Context API for state management instead of Redux.

**Reasoning**:

- Simpler implementation for the scope of this project
- Fewer dependencies
- Native to React with no additional libraries

**Trade-offs**:

- Less structured state management for larger applications
- Fewer developer tools compared to Redux DevTools
- May need refactoring if app scales significantly

### 3. MongoDB vs. SQL Database

**Decision**: Used MongoDB as the database solution.

**Reasoning**:

- Flexible schema for evolving data structures
- Better performance for read-heavy chat operations
- Native JSON support aligns with JavaScript stack

**Trade-offs**:

- Less structured relationships between entities
- Limited transaction support
- Potentially more complex queries for reports/analytics

## 🔍 Code Quality & Best Practices

- **Modular Architecture**: Separated concerns with models, routes, middleware
- **Error Handling**: Comprehensive error handling throughout the application
- **Async/Await**: Used modern JavaScript patterns for asynchronous operations
- **Code Comments**: Documented complex logic and important decisions
- **Environment Variables**: Secured sensitive information using environment variables
- **Validation**: Implemented input validation on both client and server
- **Responsive Design**: Ensured UI works across device sizes

## 🚀 Scalability Considerations

If scaling this application for production use, I would implement:

1. **Microservices Architecture**: Split messaging, file handling, and authentication
2. **Cloud Storage**: Migrate to AWS S3 or similar for file storage
3. **Caching Layer**: Redis for session and frequent data caching
4. **Load Balancing**: Distribute socket connections across multiple servers
5. **Database Sharding**: Partition data for better performance
6. **CDN Integration**: Faster file delivery worldwide
7. **Containerization**: Docker and Kubernetes for easier deployment and scaling

## 🧪 Testing Approach

- **Unit Tests**: For isolated function testing
- **Integration Tests**: For API endpoint validation
- **End-to-End Tests**: For critical user flows
- **Socket Testing**: For real-time communication validation
- **Performance Testing**: For handling concurrent users

## 🔮 Future Enhancements

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
