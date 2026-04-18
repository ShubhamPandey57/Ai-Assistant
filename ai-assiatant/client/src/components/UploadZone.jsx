import { useState, useRef, useCallback } from 'react';
import { useDocuments } from '../context/DocumentContext';
import './UploadZone.css';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const ALLOWED_EXTENSIONS = [...Object.values(ALLOWED_TYPES), '.jpeg'];

const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const icons = { pdf: '📕', txt: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', webp: '🖼️' };
  return icons[ext] || '📄';
};

const UploadZone = ({ onSuccess }) => {
  const { uploadDocument } = useDocuments();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  const validate = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const mimeOk = Object.keys(ALLOWED_TYPES).includes(file.type);
    const extOk = ALLOWED_EXTENSIONS.includes(ext);
    // Some browsers report wrong MIME for doc/xls — check extension as primary
    if (!extOk) {
      return `Unsupported file type "${ext}". Allowed: PDF, DOCX, XLSX, PPTX, TXT, JPG, JPEG, PNG`;
    }
    if (file.size > MAX_SIZE) return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`;
    return null;
  };

  const handleFile = useCallback(async (file) => {
    setError('');
    setSuccess('');
    const err = validate(file);
    if (err) { setError(err); return; }

    setUploading(true);
    setProgress(10);
    const interval = setInterval(() => setProgress(p => Math.min(p + 12, 85)), 350);

    try {
      const uploaded = await uploadDocument(file);
      clearInterval(interval);
      setProgress(100);
      setSuccess(`✓ "${uploaded.originalName}" uploaded successfully!`);
      setTimeout(() => { setProgress(0); setSuccess(''); onSuccess?.(); }, 1800);
    } catch (e) {
      clearInterval(interval);
      setError(e.response?.data?.message || 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [uploadDocument, onSuccess]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div>
      <div
        id="upload-dropzone"
        className={`upload-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          id="upload-file-input"
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={onInputChange}
        />
        <div className="upload-zone-icon">{dragging ? '📂' : '☁'}</div>
        <p className="upload-zone-title">
          {uploading ? 'Uploading...' : dragging ? 'Drop it here!' : 'Drag & drop your document here'}
        </p>
        {!uploading && (
          <div className="upload-type-badges">
            {['PDF', 'DOCX', 'XLSX', 'IMAGES', 'TXT'].map(t => (
              <span key={t} className="upload-type-badge">{t}</span>
            ))}
          </div>
        )}
        {!uploading && <p className="upload-zone-hint">or click to browse · Max 10 MB</p>}
      </div>

      {progress > 0 && (
        <div className="upload-progress-bar">
          <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <div className="alert alert-error" style={{ marginTop: 10 }}>⚠ {error}</div>}
      {success && <div className="alert alert-success" style={{ marginTop: 10 }}>{success}</div>}
    </div>
  );
};

export { getFileIcon };
export default UploadZone;
