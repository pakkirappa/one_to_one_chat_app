import React, { useState } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { saveAs } from "file-saver";
import axios from "axios";
import moment from "moment";
import "./FileMessage.css";
import "./VideoMessage.css";

const FileMessage = ({ message, isOwn }) => {
  const { fileInfo } = message;

  // Debug logs to help troubleshoot
  console.log("FileMessage rendering with:", fileInfo);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatMessageTime = (time) => {
    return moment(time).format("HH:mm");
  };

  const getFileIcon = (mimetype, category) => {
    switch (category) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "audio":
        return "🎵";
      case "document":
        return "📄";
      default:
        return "📎";
    }
  };

  const getFileTypeColor = (category) => {
    switch (category) {
      case "image":
        return "success";
      case "video":
        return "info";
      case "audio":
        return "warning";
      case "document":
        return "primary";
      default:
        return "secondary";
    }
  };

  // Ensure URL is properly formatted
  const getProperUrl = (url) => {
    if (!url) return "";
    // If it's already a full URL
    if (url.startsWith("http")) return url;
    // If it's a relative URL, ensure it starts with a slash
    return url.startsWith("/") ? url : `/${url}`;
  };

  const handleDownload = async () => {
    try {
      const url = getProperUrl(fileInfo.url);
      console.log("Downloading from URL:", url);

      const response = await axios.get(url, {
        responseType: "blob",
      });

      saveAs(response.data, fileInfo.originalName);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handlePreview = () => {
    if (fileInfo.category === "image") {
      const url = getProperUrl(fileInfo.url);
      console.log("Opening preview with URL:", url);
      window.open(url, "_blank");
    }
  };

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.onerror = null;
    e.target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgbG9hZGVkPC90ZXh0Pjwvc3ZnPg==";
  };

  const renderFileContent = () => {
    if (!fileInfo) {
      console.error("No fileInfo available in message:", message);
      return <div className="p-3 text-danger">File information missing</div>;
    }

    const url = getProperUrl(fileInfo.url);
    console.log("Rendering file with URL:", url);

    switch (fileInfo.category) {
      case "image":
        return (
          <div className="position-relative">
            <div
              className="mb-1 file-name text-center"
              style={{ padding: "0 10px" }}
            >
              {fileInfo.originalName.length > 30
                ? fileInfo.originalName.substring(0, 30) + "..."
                : fileInfo.originalName}
            </div>
            <img
              src={url}
              alt={fileInfo.originalName}
              className="img-fluid rounded-3 cursor-pointer file-message-image"
              onClick={handlePreview}
              onError={handleImageError}
              loading="lazy"
            />
            <div className="position-absolute bottom-0 end-0 m-2">
              <Button
                variant="dark"
                className="download-button"
                onClick={handleDownload}
                title="Download image"
              >
                ⬇️
              </Button>
            </div>
            <div className="mt-1 text-center">
              <small className="file-size">
                {formatFileSize(fileInfo.size)}
              </small>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="video-player-container">
            <div className="video-file-info">
              <div className="video-file-name">
                {fileInfo.originalName.length > 30
                  ? fileInfo.originalName.substring(0, 30) + "..."
                  : fileInfo.originalName}
              </div>
              <small className="file-size">
                {formatFileSize(fileInfo.size)}
              </small>
            </div>
            <div className="position-relative">
              <video
                controls
                preload="metadata"
                className="video-player"
                onError={(e) => console.error("Video failed to load:", e)}
                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaWRlbyBsb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=="
              >
                <source src={url} type={fileInfo.mimetype} />
                Your browser does not support the video tag.
              </video>
              <div className="position-absolute top-0 end-0 m-2">
                <Button
                  variant="dark"
                  className="download-button"
                  onClick={handleDownload}
                  title="Download video"
                >
                  ⬇️
                </Button>
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="audio-player-container">
            <div className="d-flex align-items-center">
              <div className="file-icon">
                {getFileIcon(fileInfo.mimetype, fileInfo.category)}
              </div>
              <div>
                <div className="file-name">{fileInfo.originalName}</div>
                <small className="file-size d-block">
                  {formatFileSize(fileInfo.size)}
                </small>
              </div>
            </div>
            <audio
              controls
              className="audio-player mt-2"
              onError={(e) => console.error("Audio failed to load:", e)}
              preload="metadata"
            >
              <source src={url} type={fileInfo.mimetype} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      default:
        return (
          <Card className="border-0 file-card">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="file-icon">
                    {getFileIcon(fileInfo.mimetype, fileInfo.category)}
                  </div>
                  <div>
                    <div className="file-name">{fileInfo.originalName}</div>
                    <div className="d-flex align-items-center gap-2">
                      <small className="file-size">
                        {formatFileSize(fileInfo.size)}
                      </small>
                      <Badge
                        bg={getFileTypeColor(fileInfo.category)}
                        className="file-type-badge text-uppercase"
                      >
                        {fileInfo.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  className="file-download-btn"
                  onClick={handleDownload}
                  title="Download file"
                >
                  ⬇️
                </Button>
              </div>
            </Card.Body>
          </Card>
        );
    }
  };

  return (
    <div className={`${isOwn ? "text-end" : "text-start"} mb-3`}>
      <div
        className={`d-inline-block file-message-container ${
          isOwn ? "ms-auto own-message" : "me-auto other-message"
        }`}
        style={{ maxWidth: "320px" }}
      >
        <div className={`p-3 rounded-3 ${isOwn ? "text-white" : "text-dark"}`}>
          {renderFileContent()}
          {/* Message timestamp */}
          <div className="file-timestamp">
            {formatMessageTime(message.createdAt)}
            {isOwn && (
              <span
                className={`message-read-status ${
                  message.isRead ? "read" : ""
                }`}
              >
                {message.isTemp ? "⏳" : message.isRead ? "✓✓" : "✓"}
                {message.isRead && message.readAt && (
                  <span
                    className="ms-1"
                    style={{ fontSize: "0.65rem", opacity: 0.9 }}
                  >
                    {moment(message.readAt).format("HH:mm")}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileMessage;
