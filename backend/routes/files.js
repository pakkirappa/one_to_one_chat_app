const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { upload, getFileCategory, formatFileSize } = require('../middleware/fileUpload');
const { authenticateToken } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const router = express.Router();

// Helper function to emit socket events (will be injected by server.js)
let io = null;
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Upload file endpoint
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request body:', req.body);
    console.log('File upload request user:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { receiverId } = req.body;
    console.log('Received receiverId:', receiverId, 'Type:', typeof receiverId);
    
    if (!receiverId || receiverId === 'undefined' || receiverId === 'null') {
      console.log('Invalid receiverId detected, returning error');
      return res.status(400).json({ message: 'Valid receiver ID is required' });
    }

    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      console.log('Invalid ObjectId format for receiverId:', receiverId);
      return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    console.log('receiverId passed validation:', receiverId);

    const file = req.file;
    const category = getFileCategory(file.mimetype);
    
    // Create file info object
    const fileInfo = {
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      category: category,
      url: `/api/files/download/${file.filename}`
    };

    // Create message with file attachment
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content: file.originalname, // Use filename as content
      messageType: category,
      fileInfo: fileInfo
    });

    await message.save();

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, receiverId],
        lastMessage: message._id,
        lastMessageAt: new Date()
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
    }

    await conversation.save();

    // Populate message for response
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    // Emit socket message if io is available
    if (io) {
      console.log('Emitting newMessage event for conversation:', conversation._id);
      console.log('Message data being emitted:', {
        sender: message.sender.username,
        receiver: message.receiver.username,
        messageType: message.messageType,
        filename: message.fileInfo?.originalName
      });
      
      // Emit to conversation room
      io.to(`conversation_${conversation._id}`).emit('newMessage', {
        message,
        conversationId: conversation._id
      });

      // Also emit directly to both sender and receiver for immediate updates
      io.to(req.user._id.toString()).emit('newMessage', {
        message,
        conversationId: conversation._id
      });
      
      io.to(receiverId.toString()).emit('newMessage', {
        message,
        conversationId: conversation._id
      });

      console.log('Socket event emitted for file upload');
    } else {
      console.log('Socket.IO not available, skipping event emission');
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      data: message
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Download/serve file endpoint
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Search for file in all subdirectories
    const subdirs = ['images', 'documents', 'videos', 'audio', 'others'];
    let filePath = null;
    
    for (const subdir of subdirs) {
      const potentialPath = path.join(uploadsDir, subdir, filename);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        break;
      }
    }
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ message: 'File download failed', error: error.message });
  }
});

// Get file info endpoint
router.get('/info/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    const message = await Message.findOne({ 'fileInfo.filename': filename })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');
    
    if (!message) {
      return res.status(404).json({ message: 'File info not found' });
    }
    
    res.json({
      fileInfo: message.fileInfo,
      message: message
    });
    
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ message: 'Failed to get file info', error: error.message });
  }
});

// Delete file endpoint
router.delete('/delete/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }
    
    // Delete file from filesystem
    if (message.fileInfo && message.fileInfo.path) {
      try {
        await fs.remove(message.fileInfo.path);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }
    
    // Delete message from database
    await Message.findByIdAndDelete(messageId);
    
    res.json({ message: 'File deleted successfully' });
    
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

module.exports = { router, setSocketIO };
