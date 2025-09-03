const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} (ID: ${socket.userId}) connected with socket ID: ${socket.id}`);

    // Add user to connected users
    connectedUsers.set(socket.userId, socket.id);
    console.log('Connected users now:', Array.from(connectedUsers.keys()));

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { 
      isOnline: true 
    });

    // Join user to their personal room
    socket.join(socket.userId);
    console.log(`User ${socket.user.username} joined personal room: ${socket.userId}`);

    // Emit user online status to all connected users
    socket.broadcast.emit('userOnline', {
      userId: socket.userId,
      username: socket.user.username,
      isOnline: true
    });

    // Handle joining a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.username} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.user.username} left conversation ${conversationId}`);
    });

    // Handle sending messages (including files)
    socket.on('sendMessage', async (data) => {
      try {
        console.log(`User ${socket.user.username} (${socket.userId}) attempting to send message:`, data);
        
        const { receiverId, content, messageType = 'text', fileInfo } = data;

        if (!receiverId) {
          console.error('No receiverId provided by', socket.user.username);
          socket.emit('messageError', {
            error: 'Receiver ID is required',
            tempId: data.tempId
          });
          return;
        }

        if (!content && !fileInfo) {
          console.error('No content or fileInfo provided by', socket.user.username);
          socket.emit('messageError', {
            error: 'Message content is required',
            tempId: data.tempId
          });
          return;
        }

        // Create and save message
        const messageData = {
          sender: socket.userId,
          receiver: receiverId,
          messageType
        };

        // Handle different message types
        if (messageType === 'text') {
          messageData.content = content;
        } else {
          // For file messages, content is usually the filename
          messageData.content = content || fileInfo?.originalName || 'File';
          messageData.fileInfo = fileInfo;
        }

        console.log('Creating message with data:', messageData);
        const message = new Message(messageData);
        await message.save();
        console.log('Message saved successfully:', message._id);

        // Find or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [socket.userId, receiverId] }
        });

        console.log('Existing conversation found:', !!conversation);

        if (!conversation) {
          console.log('Creating new conversation between', socket.userId, 'and', receiverId);
          conversation = new Conversation({
            participants: [socket.userId, receiverId],
            lastMessage: message._id,
            lastMessageAt: new Date()
          });
        } else {
          console.log('Updating existing conversation:', conversation._id);
          conversation.lastMessage = message._id;
          conversation.lastMessageAt = new Date();
        }

        await conversation.save();
        console.log('Conversation saved:', conversation._id);

        // Populate message
        await message.populate('sender', 'username avatar');
        await message.populate('receiver', 'username avatar');
        console.log('Message populated with sender/receiver data');

        // Emit to conversation room
        console.log(`Emitting to conversation room: conversation_${conversation._id}`);
        io.to(`conversation_${conversation._id}`).emit('newMessage', {
          message,
          conversationId: conversation._id
        });

        // Also emit directly to receiver if they're online
        const receiverSocketId = connectedUsers.get(receiverId);
        console.log('Receiver socket ID:', receiverSocketId, 'for receiverId:', receiverId);
        if (receiverSocketId) {
          console.log('Emitting directly to receiver socket:', receiverSocketId);
          io.to(receiverSocketId).emit('newMessage', {
            message,
            conversationId: conversation._id
          });
        } else {
          console.log('Receiver not online or not found in connectedUsers');
        }

        // Send confirmation to sender
        console.log('Sending confirmation to sender:', socket.user.username);
        socket.emit('messageSent', {
          tempId: data.tempId,
          message,
          conversationId: conversation._id
        });

        console.log('Message processing completed successfully');

      } catch (error) {
        console.error('Error in sendMessage handler:', error);
        socket.emit('messageError', {
          error: 'Failed to send message',
          tempId: data.tempId
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, conversationId, isTyping } = data;
      
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          username: socket.user.username,
          conversationId,
          isTyping
        });
      }
    });

    // Handle message read status
    socket.on('markAsRead', async (data) => {
      try {
        const { conversationId, messageIds } = data;

        // Update message read status
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            receiver: socket.userId,
            isRead: false
          },
          {
            $set: {
              isRead: true,
              readAt: new Date()
            }
          }
        );

        // Emit read receipt to conversation room
        io.to(`conversation_${conversationId}`).emit('messagesRead', {
          messageIds,
          readBy: socket.userId,
          readAt: new Date()
        });

      } catch (error) {
        socket.emit('readError', { error: 'Failed to mark messages as read' });
      }
    });

    // Handle getting online users
    socket.on('getOnlineUsers', () => {
      const onlineUsers = Array.from(connectedUsers.keys());
      socket.emit('onlineUsers', onlineUsers);
    });

    // Handle user status updates
    socket.on('updateStatus', async (status) => {
      try {
        await User.findByIdAndUpdate(socket.userId, { 
          customStatus: status 
        });

        socket.broadcast.emit('userStatusUpdate', {
          userId: socket.userId,
          status
        });
      } catch (error) {
        socket.emit('statusError', { error: 'Failed to update status' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Remove user from connected users
      connectedUsers.delete(socket.userId);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Emit user offline status
      socket.broadcast.emit('userOffline', {
        userId: socket.userId,
        username: socket.user.username,
        isOnline: false,
        lastSeen: new Date()
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.log('Socket error:', error);
    });
  });

  return io;
};

module.exports = socketHandler;
