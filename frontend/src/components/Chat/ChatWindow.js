import React, { useState, useRef, useEffect, useCallback } from "react";
import { Form, Button, Badge, InputGroup } from "react-bootstrap";
import { useSocket } from "../../contexts/SocketContext";
import FileUpload from "./FileUpload";
import FileMessage from "./FileMessage";
import moment from "moment";
import "./ChatWindow.css";

const ChatWindow = ({ conversation, messages, currentUser }) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const {
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    typingUsers,
    setMessages,
    markMessagesAsRead,
  } = useSocket();

  // Improved scroll to bottom function with better reliability
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, []);

  // Enhanced scroll effect with proper dependencies
  useEffect(() => {
    // Immediate scroll for new messages
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages.length, scrollToBottom]); // Only trigger when message count changes

  // Scroll on conversation change
  useEffect(() => {
    if (conversation) {
      setTimeout(scrollToBottom, 200);
    }
  }, [conversation, scrollToBottom]);

  // Function to check and mark unread messages
  const checkAndMarkUnreadMessages = useCallback(() => {
    if (!conversation || conversation.isTemp || !messages.length) return;

    const currentUserId = currentUser.id.toString();

    // Find unread messages addressed to current user
    const unreadMessages = messages.filter(
      (message) =>
        message.receiver._id.toString() === currentUserId &&
        message.sender._id.toString() !== currentUserId &&
        !message.isRead &&
        !message.isTemp
    );

    if (unreadMessages.length > 0) {
      console.log("Marking messages as read:", unreadMessages.length);
      const messageIds = unreadMessages.map((msg) => msg._id);

      // Update local state immediately for a responsive UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (messageIds.includes(msg._id)) {
            return { ...msg, isRead: true, readAt: new Date().toISOString() };
          }
          return msg;
        })
      );

      // Mark these messages as read in the database
      markMessagesAsRead(conversation._id, messageIds);
    }
  }, [conversation, messages, currentUser.id, markMessagesAsRead, setMessages]);

  // Monitor visible messages and mark them as read
  const visibilityRef = useRef(true);

  useEffect(() => {
    // Track document visibility
    const handleVisibilityChange = () => {
      visibilityRef.current = document.visibilityState === "visible";

      // If returning to visible and in a conversation, check for unread messages
      if (visibilityRef.current && conversation && !conversation.isTemp) {
        checkAndMarkUnreadMessages();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversation, checkAndMarkUnreadMessages]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (visibilityRef.current) {
      checkAndMarkUnreadMessages();
    }
  }, [conversation, messages, checkAndMarkUnreadMessages]);

  useEffect(() => {
    if (conversation && !conversation.isTemp) {
      joinConversation(conversation._id);

      return () => {
        leaveConversation(conversation._id);
      };
    } else if (conversation && conversation.isTemp) {
      // For temporary conversations, we need to handle them differently
      // since they don't have real conversation IDs yet
      console.log("Temporary conversation created:", conversation);
    }
  }, [conversation, joinConversation, leaveConversation]);

  const getOtherParticipant = () => {
    if (!conversation) return null;
    // Ensure both IDs are strings for proper comparison
    const currentUserId = currentUser.id.toString();
    const other = conversation.participants.find(
      (p) => p._id.toString() !== currentUserId
    );
    return other;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!conversation || conversation.isTemp) return;

    const otherUser = getOtherParticipant();
    if (!otherUser) return;

    // Handle typing indicator
    if (!value.trim()) {
      if (isTyping) {
        console.log("Stopped typing");
        setIsTyping(false);
        sendTypingIndicator(otherUser._id.toString(), conversation._id, false);
      }
      return;
    }

    // Send typing indicator with throttling
    if (!isTyping) {
      console.log("Started typing");
      setIsTyping(true);
      sendTypingIndicator(otherUser._id.toString(), conversation._id, true);
    }

    // Clear existing timeout and set a new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      console.log("Typing timeout reached");
      setIsTyping(false);
      sendTypingIndicator(otherUser._id.toString(), conversation._id, false);
    }, 2000);
  };

  const handleFileUploaded = useCallback(
    (messageData) => {
      console.log("File uploaded successfully:", messageData);

      // Add the message immediately for instant feedback
      setMessages((prevMessages) => {
        const exists = prevMessages.find((msg) => msg._id === messageData._id);
        if (exists) {
          console.log("Message already exists, skipping duplicate");
          return prevMessages;
        }
        console.log("Adding new file message immediately");
        return [...prevMessages, messageData];
      });

      // If this was a temporary conversation, join the real conversation room
      if (conversation && conversation.isTemp && messageData.conversationId) {
        console.log(
          "Joining real conversation room after file upload:",
          messageData.conversationId
        );
        joinConversation(messageData.conversationId);
      }

      // Ensure scroll to bottom after file upload with longer delay
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    },
    [setMessages, conversation, joinConversation, scrollToBottom]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !conversation) return;

    const otherUser = getOtherParticipant();
    if (otherUser) {
      sendMessage(otherUser._id.toString(), messageInput.trim());
    }

    setMessageInput("");

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      if (otherUser) {
        sendTypingIndicator(otherUser._id.toString(), conversation._id, false);
      }
    }

    // Ensure scroll to bottom after sending
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessageTime = (time) => {
    return moment(time).format("HH:mm");
  };

  const getUserInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  const getFilteredMessages = () => {
    if (!conversation) return [];

    const otherUser = getOtherParticipant();
    if (!otherUser) return [];

    const currentUserId = currentUser.id.toString();
    const otherUserId = otherUser._id.toString();

    const filtered = messages.filter(
      (message) =>
        (message.sender._id.toString() === currentUserId &&
          message.receiver._id.toString() === otherUserId) ||
        (message.sender._id.toString() === otherUserId &&
          message.receiver._id.toString() === currentUserId)
    );

    return filtered;
  };

  const isTypingInThisConversation = () => {
    if (!conversation) return false;

    return Object.values(typingUsers).some(
      (typing) =>
        typing.conversationId === conversation._id &&
        typing.userId !== currentUser.id
    );
  };

  if (!conversation) {
    return (
      <div className="d-flex flex-column h-100 align-items-center justify-content-center bg-light">
        <div className="welcome-container">
          <div className="welcome-icon">💬</div>
          <h3 className="text-primary mb-3">Welcome to Chat App</h3>
          <p className="text-muted">
            Select a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();
  const conversationMessages = getFilteredMessages();

  return (
    <div className="d-flex flex-column h-100 bg-light chat-messages-container">
      {/* Chat Header */}
      <div className="p-3 bg-white border-bottom shadow-sm flex-shrink-0 chat-header">
        <div className="d-flex align-items-center">
          <div className="position-relative me-3">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center chat-avatar"
              style={{ width: "45px", height: "45px" }}
            >
              {getUserInitials(otherUser?.username)}
            </div>
            {otherUser?.isOnline && (
              <div
                className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle online-indicator"
                style={{ width: "12px", height: "12px" }}
              ></div>
            )}
          </div>
          <div>
            <h5 className="mb-0">{otherUser?.username}</h5>
            <small className="text-muted">
              {otherUser?.isOnline ? (
                <Badge bg="success" className="me-1">
                  Online
                </Badge>
              ) : otherUser?.lastSeen ? (
                `Last seen ${moment(otherUser.lastSeen).fromNow()}`
              ) : (
                "Offline"
              )}
            </small>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-grow-1 chat-messages-scroll">
        <div className="messages-container">
          {conversationMessages.length === 0 ? (
            <div className="empty-conversation">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            conversationMessages.map((message, index) => {
              const isOwn =
                message.sender._id.toString() === currentUser.id.toString();

              return (
                <div
                  key={message._id || message.tempId || index}
                  className={`d-flex ${
                    isOwn ? "justify-content-end" : "justify-content-start"
                  } mb-2`}
                >
                  {message.messageType && message.messageType !== "text" ? (
                    // File message
                    <FileMessage message={message} isOwn={isOwn} />
                  ) : (
                    // Text message
                    <div
                      className={`px-3 py-2 rounded-3 shadow-sm message-bubble ${
                        isOwn
                          ? "bg-primary text-white"
                          : "bg-white text-dark border"
                      } ${message.isTemp ? "opacity-75" : ""}`}
                      style={{ maxWidth: "70%", wordWrap: "break-word" }}
                    >
                      <div>{message.content}</div>
                      <div
                        className={`mt-1 text-end message-timestamp ${
                          isOwn ? "text-light" : "text-muted"
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                        {isOwn && (
                          <span
                            className={`message-status ${
                              message.isRead ? "text-success" : ""
                            }`}
                          >
                            {message.isTemp
                              ? "⏳"
                              : message.isRead
                              ? "✓✓"
                              : "✓"}
                            {message.isRead && message.readAt && (
                              <span
                                className="ms-1 read-time"
                                title={`Read at ${formatMessageTime(
                                  message.readAt
                                )}`}
                              >
                                {moment(message.readAt).format("HH:mm")}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isTypingInThisConversation() && (
            <div className="d-flex justify-content-start mb-2 typing-indicator-container">
              <div className="typing-indicator">
                <small className="text-muted fst-italic">
                  {otherUser?.username} is typing
                  <span className="ms-2">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </span>
                </small>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-top flex-shrink-0 message-input-container">
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Button
              variant="outline-secondary"
              onClick={() => setShowFileUpload(true)}
              title="Upload file"
              disabled={!conversation || !getOtherParticipant()}
              className="upload-button"
            >
              📎
            </Button>
            <Form.Control
              as="textarea"
              rows={1}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="border-0 shadow-sm message-input"
              style={{
                resize: "none",
                maxHeight: "100px",
                minHeight: "38px",
              }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!messageInput.trim()}
              className="px-4 send-button"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-send"
                viewBox="0 0 16 16"
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54L13.026 8l2.938 7.314a.5.5 0 0 1-.11.54.5.5 0 0 1-.54.11L1 9.5a.5.5 0 0 1 0-.967L15.314.146a.5.5 0 0 1 .54 0Z" />
              </svg>
            </Button>
          </InputGroup>
        </Form>

        {/* File Upload Modal */}
        {conversation && getOtherParticipant() && (
          <FileUpload
            show={showFileUpload}
            onHide={() => setShowFileUpload(false)}
            receiverId={getOtherParticipant()._id.toString()}
            onFileUploaded={handleFileUploaded}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
