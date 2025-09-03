import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import axios from 'axios';
import moment from 'moment';

const FileMessage = ({ message, isOwn }) => {
  const { fileInfo } = message;
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMessageTime = (time) => {
    return moment(time).format('HH:mm');
  };

  const getFileIcon = (mimetype, category) => {
    switch (category) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📎';
    }
  };

  const getFileTypeColor = (category) => {
    switch (category) {
      case 'image': return 'success';
      case 'video': return 'info';
      case 'audio': return 'warning';
      case 'document': return 'primary';
      default: return 'secondary';
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(fileInfo.url, {
        responseType: 'blob',
      });
      
      saveAs(response.data, fileInfo.originalName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePreview = () => {
    if (fileInfo.category === 'image') {
      window.open(fileInfo.url, '_blank');
    }
  };

  const renderFileContent = () => {
    switch (fileInfo.category) {
      case 'image':
        return (
          <div className="position-relative">
            <img
              src={fileInfo.url}
              alt={fileInfo.originalName}
              className="img-fluid rounded cursor-pointer"
              style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
              onClick={handlePreview}
            />
            <div className="position-absolute bottom-0 end-0 m-1">
              <Button size="sm" variant="dark" className="opacity-75" onClick={handleDownload}>
                ⬇️
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="position-relative">
            <video
              controls
              className="rounded"
              style={{ maxWidth: '300px', maxHeight: '200px' }}
            >
              <source src={fileInfo.url} type={fileInfo.mimetype} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="p-3 bg-light rounded">
            <div className="d-flex align-items-center mb-2">
              <span className="me-2" style={{ fontSize: '1.5rem' }}>🎵</span>
              <div>
                <div className="fw-medium">{fileInfo.originalName}</div>
                <small className="text-muted">{formatFileSize(fileInfo.size)}</small>
              </div>
            </div>
            <audio controls className="w-100">
              <source src={fileInfo.url} type={fileInfo.mimetype} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      default:
        return (
          <Card className="border-0 bg-light">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '1.5rem' }}>
                    {getFileIcon(fileInfo.mimetype, fileInfo.category)}
                  </span>
                  <div>
                    <div className="fw-medium text-truncate" style={{ maxWidth: '200px' }}>
                      {fileInfo.originalName}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted">{formatFileSize(fileInfo.size)}</small>
                      <Badge bg={getFileTypeColor(fileInfo.category)} className="text-uppercase">
                        {fileInfo.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline-primary" onClick={handleDownload}>
                  ⬇️
                </Button>
              </div>
            </Card.Body>
          </Card>
        );
    }
  };

  return (
    <div className={`${isOwn ? 'text-end' : 'text-start'} mb-2`}>
      <div 
        className={`d-inline-block ${isOwn ? 'ms-auto' : 'me-auto'}`}
        style={{ maxWidth: '70%' }}
      >
        <div className={`p-2 rounded-3 shadow-sm ${
          isOwn 
            ? 'bg-primary' 
            : 'bg-white border'
        }`}>
          {renderFileContent()}
          {/* Message timestamp */}
          <div className={`mt-2 text-end ${isOwn ? 'text-light' : 'text-muted'}`} 
               style={{ fontSize: '0.75rem' }}>
            {formatMessageTime(message.createdAt)}
            {isOwn && (
              <span className="ms-1">
                {message.isTemp ? '⏳' : message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileMessage;
