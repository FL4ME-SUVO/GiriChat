// src/components/FileUploadModal/FileUploadModal.jsx
import React, { useState, useRef } from 'react';
import './FileUploadModal.css';

const FileUploadModal = ({ onClose, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create a preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = () => {
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const fileTypes = [
    { name: 'Document', icon: '📄', extensions: ['.doc', '.docx', '.pdf', '.txt'] },
    { name: 'Image', icon: '🖼️', extensions: ['.jpg', '.jpeg', '.png', '.gif'] },
    { name: 'Video', icon: '🎬', extensions: ['.mp4', '.mov', '.avi'] },
    { name: 'Audio', icon: '🎵', extensions: ['.mp3', '.wav'] },
    { name: 'Other', icon: '📁', extensions: ['.zip', '.rar'] },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Upload File</h2>
        
        <div className="file-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" />
          ) : file ? (
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-name">{file.name}</div>
              <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📁</div>
              <p>Select a file to upload</p>
            </div>
          )}
        </div>
        
        <div className="file-type-grid">
          {fileTypes.map((type, index) => (
            <div 
              key={index}
              className="file-type-card"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="type-icon">{type.icon}</div>
              <div className="type-name">{type.name}</div>
            </div>
          ))}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button 
          className="upload-button"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload File
        </button>
      </div>
    </div>
  );
};

export default FileUploadModal;