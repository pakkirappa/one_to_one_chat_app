import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      console.log(
        "Setting up socket connection for user:",
        user.username,
        "Token exists:",
        !!token
      );

      const newSocket = io("http://localhost:5000", {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log(
          "Socket connected successfully for user:",
          user.username,
          "Socket ID:",
          newSocket.id
        );
        setSocket(newSocket);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected for user:", user.username);
      });

      newSocket.on("connect_error", (error) => {
        console.error(
          "Socket connection error for user:",
          user.username,
          error
        );
        toast.error("Connection failed");
      });

      // Handle new messages
      newSocket.on("newMessage", (data) => {
        const { message, conversationId } = data;
        console.log(
          "Received new message via Socket for user:",
          user.username,
          "Message from:",
          message.sender.username,
          "To:",
          message.receiver.username
        );

        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.find((msg) => msg._id === message._id);
          if (exists) {
            console.log("Message already exists, skipping duplicate");
            return prevMessages;
          }
          console.log("Adding new message from Socket event");
          return [...prevMessages, message];
        });

        // Update conversations
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conv) => {
            if (conv._id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt,
              };
            }
            return conv;
          });

          // Sort by last message time
          return updatedConversations.sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          );
        });

        // Show notification if message is from another user
        if (message.sender._id !== user.id) {
          const messageText =
            message.messageType && message.messageType !== "text"
              ? `Sent a ${message.messageType}`
              : message.content;
          toast.success(`${message.sender.username}: ${messageText}`);
        }
      });

      // Handle message sent confirmation
      newSocket.on("messageSent", (data) => {
        const { tempId, message } = data;
        console.log(
          "Message sent confirmation received for user:",
          user.username,
          "tempId:",
          tempId,
          "message:",
          message._id
        );

        // Replace temp message with real message
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.tempId === tempId ? message : msg))
        );
      });

      // Handle message errors
      newSocket.on("messageError", (data) => {
        console.error("Message error received:", data);
        const { error, tempId } = data;
        toast.error(`Message failed: ${error}`);

        // Remove failed message
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.tempId !== tempId)
        );
      });

      // Handle user online/offline status
      newSocket.on("userOnline", (data) => {
        setOnlineUsers((prevUsers) => {
          if (!prevUsers.includes(data.userId)) {
            return [...prevUsers, data.userId];
          }
          return prevUsers;
        });
      });

      newSocket.on("userOffline", (data) => {
        setOnlineUsers((prevUsers) =>
          prevUsers.filter((userId) => userId !== data.userId)
        );
      });

      // Handle typing indicators
      newSocket.on("userTyping", (data) => {
        const { userId, username, conversationId, isTyping } = data;

        setTypingUsers((prev) => {
          const key = `${conversationId}-${userId}`;
          if (isTyping) {
            return { ...prev, [key]: { userId, username, conversationId } };
          } else {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          }
        });
      });

      // Handle message read receipts
      newSocket.on("messagesRead", (data) => {
        const { messageIds, readBy, readAt } = data;
        console.log(
          "Received read receipts for messages:",
          messageIds.length,
          "Read by:",
          readBy,
          "At:",
          readAt
        );

        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (messageIds.includes(msg._id) && msg.sender._id === user.id) {
              console.log("Marking message as read:", msg._id);
              return { ...msg, isRead: true, readAt };
            }
            return msg;
          })
        );
      });

      // Get initial online users
      newSocket.emit("getOnlineUsers");
      newSocket.on("onlineUsers", setOnlineUsers);

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [user]);

  // Socket event handlers
  const sendMessage = (receiverId, content, messageType = "text") => {
    console.log("sendMessage called with:", {
      receiverId,
      content,
      messageType,
      socketConnected: !!socket,
      userId: user?.id,
    });

    if (!socket) {
      console.error("Socket not connected when trying to send message");
      toast.error("Connection lost. Please refresh the page.");
      return;
    }

    if (!content.trim()) {
      console.error("Empty content when trying to send message");
      return;
    }

    if (!user || !user.id) {
      console.error("User not authenticated when trying to send message");
      toast.error("Authentication error. Please login again.");
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage = {
      tempId,
      sender: { _id: user.id, username: user.username, avatar: user.avatar },
      receiver: { _id: receiverId },
      content,
      messageType,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    // Add temp message immediately
    setMessages((prev) => [...prev, tempMessage]);

    // Send to server
    console.log("Emitting sendMessage event:", {
      receiverId,
      content,
      messageType,
      tempId,
    });

    socket.emit("sendMessage", {
      receiverId,
      content,
      messageType,
      tempId,
    });
  };

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit("joinConversation", conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit("leaveConversation", conversationId);
    }
  };

  const sendTypingIndicator = (receiverId, conversationId, isTyping) => {
    if (socket) {
      socket.emit("typing", { receiverId, conversationId, isTyping });
    }
  };

  const markMessagesAsRead = (conversationId, messageIds) => {
    if (!socket) {
      console.error(
        "Socket not connected when trying to mark messages as read"
      );
      return;
    }

    if (!messageIds || messageIds.length === 0) {
      console.log("No messages to mark as read");
      return;
    }

    console.log(
      "Marking messages as read:",
      messageIds.length,
      "in conversation:",
      conversationId
    );
    socket.emit("markAsRead", { conversationId, messageIds });
  };

  const value = {
    socket,
    onlineUsers,
    messages,
    setMessages,
    conversations,
    setConversations,
    typingUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markMessagesAsRead,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
