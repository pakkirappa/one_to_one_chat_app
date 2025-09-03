import React, { useState } from 'react';
import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUpload = ({ show, onHide, receiverId, onFileUploaded }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
    setError('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('text')) return '📝';
    if (type.includes('spreadsheet')) return '📊';
    if (type.includes('presentation')) return '📺';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    if (!receiverId) {
      setError('No receiver selected');
      return;
    }

    console.log('Uploading files with receiverId:', receiverId);

    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiverId', receiverId);

        const response = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              ((progressEvent.loaded * 100) / progressEvent.total)
            );
            setUploadProgress(progress);
          },
        });

        console.log('File upload response:', response.data);
        
        // Notify parent component about successful upload
        if (onFileUploaded) {
          onFileUploaded(response.data.data);
        }
      }

      // Reset state and close modal
      setSelectedFiles([]);
      setUploadProgress(0);
      setUploading(false);
      onHide();
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Files</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!uploading && (
          <div
            {...getRootProps()}
            className={`border border-2 border-dashed rounded p-4 text-center mb-3 ${
              isDragActive ? 'border-primary bg-light' : 'border-secondary'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <input {...getInputProps()} />
            <div className="mb-2" style={{ fontSize: '3rem' }}>📁</div>
            {isDragActive ? (
              <p className="mb-0 text-primary">Drop the files here...</p>
            ) : (
              <div>
                <p className="mb-2">Drag & drop files here, or click to select</p>
                <Button variant="outline-primary" size="sm">
                  Choose Files
                </Button>
              </div>
            )}
            <small className="text-muted d-block mt-2">
              Maximum file size: 100MB per file
            </small>
          </div>
        )}

        {uploading && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <ProgressBar now={uploadProgress} />
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div>
            <h6 className="mb-3">Selected Files ({selectedFiles.length})</h6>
            <div className="max-height-300 overflow-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2" style={{ fontSize: '1.2rem' }}>
                      {getFileIcon(file)}
                    </span>
                    <div>
                      <div className="fw-medium">{file.name}</div>
                      <small className="text-muted">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </small>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={uploadFiles}
          disabled={selectedFiles.length === 0 || uploading}
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileUpload;
