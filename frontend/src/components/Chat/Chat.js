import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
import "./BootstrapChat.css";
import "./ChatEnhancements.css";

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [users, setUsers] = useState([]);
  const { user, logout } = useAuth();
  const { conversations, setConversations, messages, setMessages } =
    useSocket();

  useEffect(() => {
    fetchUsers();
    fetchConversations();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get("/api/chat/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/chat/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    // Find existing conversation or create new one
    let conversation = conversations.find((conv) =>
      conv.participants.some((p) => p._id === selectedUser._id)
    );

    if (!conversation) {
      // Create a temporary conversation object
      // Make sure both users have the same property structure
      const currentUserForConversation = {
        _id: user.id, // Convert id to _id for consistency
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      };

      conversation = {
        _id: `temp-${selectedUser._id}`,
        participants: [currentUserForConversation, selectedUser],
        isTemp: true,
      };
    }

    setSelectedConversation(conversation);
    await fetchMessages(selectedUser._id);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Container fluid className="vh-100 p-0 overflow-hidden">
      <Row className="h-100 g-0">
        <Col
          xs={12}
          md={4}
          lg={3}
          className="border-end overflow-auto"
          style={{ maxHeight: "100vh" }}
        >
          <Sidebar
            users={users}
            conversations={conversations}
            selectedConversation={selectedConversation}
            onUserSelect={handleUserSelect}
            onLogout={handleLogout}
            currentUser={user}
          />
        </Col>
        <Col xs={12} md={8} lg={9} className="h-100 overflow-hidden">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            currentUser={user}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
