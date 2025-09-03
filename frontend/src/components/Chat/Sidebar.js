import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Badge, Button } from 'react-bootstrap';
import { useSocket } from '../../contexts/SocketContext';
import moment from 'moment';

const Sidebar = ({ 
  users, 
  conversations, 
  selectedConversation, 
  onUserSelect, 
  onLogout, 
  currentUser 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, users]);

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== currentUser.id);
  };

  const isSelected = (user) => {
    if (!selectedConversation) return false;
    
    if (selectedConversation.isTemp) {
      return selectedConversation.participants.some(p => p._id === user._id);
    }
    
    return selectedConversation.participants.some(p => p._id === user._id);
  };

  const formatLastMessageTime = (time) => {
    const messageTime = moment(time);
    const now = moment();
    
    if (now.diff(messageTime, 'days') === 0) {
      return messageTime.format('HH:mm');
    } else if (now.diff(messageTime, 'days') === 1) {
      return 'Yesterday';
    } else if (now.diff(messageTime, 'days') < 7) {
      return messageTime.format('dddd');
    } else {
      return messageTime.format('DD/MM/YYYY');
    }
  };

  const getUserInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="h-100 d-flex flex-column bg-white border-end">
      {/* Header */}
      <div className="p-3 border-bottom bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center me-2" 
                 style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}>
              {getUserInitials(currentUser.username)}
            </div>
            <div>
              <h6 className="mb-0">{currentUser.username}</h6>
              <small className="opacity-75">Online</small>
            </div>
          </div>
          <Button variant="outline-light" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-light border-bottom">
        <Form.Control
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-pill"
        />
      </div>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto">
        {searchQuery.trim() ? (
          <>
            <div className="px-3 py-2 bg-light border-bottom">
              <small className="text-muted fw-bold text-uppercase">Search Results</small>
            </div>
            {filteredUsers.length > 0 ? (
              <ListGroup variant="flush">
                {filteredUsers.map(user => (
                  <ListGroup.Item
                    key={user._id}
                    action
                    active={isSelected(user)}
                    onClick={() => onUserSelect(user)}
                    className="d-flex align-items-center py-3"
                  >
                    <div className="position-relative me-3">
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                           style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                        {getUserInitials(user.username)}
                      </div>
                      {isUserOnline(user._id) && (
                        <div className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle"
                             style={{ width: '10px', height: '10px' }}></div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-1">{user.username}</h6>
                        {isUserOnline(user._id) && (
                          <Badge bg="success" pill className="ms-2">Online</Badge>
                        )}
                      </div>
                      <small className="text-muted">
                        {isUserOnline(user._id) ? 'Online' : 
                          user.lastSeen ? `Last seen ${moment(user.lastSeen).fromNow()}` : 'Offline'
                        }
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted mb-0">No users found</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recent Conversations */}
            {conversations.length > 0 && (
              <>
                <div className="px-3 py-2 bg-light border-bottom">
                  <small className="text-muted fw-bold text-uppercase">Recent Chats</small>
                </div>
                <ListGroup variant="flush">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    
                    return (
                      <ListGroup.Item
                        key={conversation._id}
                        action
                        active={selectedConversation?._id === conversation._id}
                        onClick={() => onUserSelect(otherUser)}
                        className="d-flex align-items-center py-3"
                      >
                        <div className="position-relative me-3">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                               style={{ width: '45px', height: '45px', fontSize: '16px', fontWeight: 'bold' }}>
                            {getUserInitials(otherUser.username)}
                          </div>
                          {isUserOnline(otherUser._id) && (
                            <div className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle"
                                 style={{ width: '12px', height: '12px' }}></div>
                          )}
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="mb-1 text-truncate">{otherUser.username}</h6>
                            {conversation.lastMessage && (
                              <small className="text-muted">
                                {formatLastMessageTime(conversation.lastMessageAt)}
                              </small>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="mb-0 text-muted small text-truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          <small className="text-muted">
                            {isUserOnline(otherUser._id) ? 'Online' : 
                              otherUser.lastSeen ? `Last seen ${moment(otherUser.lastSeen).fromNow()}` : 'Offline'
                            }
                          </small>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </>
            )}

            {/* All Users */}
            <div className="px-3 py-2 bg-light border-bottom">
              <small className="text-muted fw-bold text-uppercase">All Users</small>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-muted mb-0">No users available</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {users.map((user) => (
                  <ListGroup.Item
                    key={user._id}
                    action
                    active={isSelected(user)}
                    onClick={() => onUserSelect(user)}
                    className="d-flex align-items-center py-3"
                  >
                    <div className="position-relative me-3">
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                           style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                        {getUserInitials(user.username)}
                      </div>
                      {isUserOnline(user._id) && (
                        <div className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle"
                             style={{ width: '10px', height: '10px' }}></div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-1">{user.username}</h6>
                        {isUserOnline(user._id) && (
                          <Badge bg="success" pill className="ms-2">Online</Badge>
                        )}
                      </div>
                      <small className="text-muted">
                        {isUserOnline(user._id) ? 'Online' : 
                          user.lastSeen ? `Last seen ${moment(user.lastSeen).fromNow()}` : 'Offline'
                        }
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
