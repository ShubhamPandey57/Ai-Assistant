import './DocumentCard.css';

const FILE_CONFIG = {
  'application/pdf': { label: 'PDF', icon: '📕', cls: 'badge-pdf' },
  'text/plain': { label: 'TXT', icon: '📄', cls: 'badge-txt' },
  'application/msword': { label: 'DOC', icon: '📝', cls: 'badge-doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', icon: '📝', cls: 'badge-doc' },
  'application/vnd.ms-excel': { label: 'XLS', icon: '📊', cls: 'badge-excel' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', icon: '📊', cls: 'badge-excel' },
  'application/vnd.ms-powerpoint': { label: 'PPT', icon: '📑', cls: 'badge-ppt' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PPTX', icon: '📑', cls: 'badge-ppt' },
  'image/jpeg': { label: 'IMG', icon: '🖼️', cls: 'badge-img' },
  'image/png': { label: 'IMG', icon: '🖼️', cls: 'badge-img' },
  'image/webp': { label: 'IMG', icon: '🖼️', cls: 'badge-img' },
};

const DocumentCard = ({ document, formatBytes, onDelete, onChat, onFlashcards }) => {
  const config = FILE_CONFIG[document.fileType] || { label: 'FILE', icon: '📄', cls: 'badge-txt' };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="doc-card">
      <div className="doc-card-header">
        <div className="doc-icon">{config.icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${config.cls}`}>{config.label}</span>
          <button
            id={`delete-btn-${document._id}`}
            className="btn btn-danger btn-icon btn-sm"
            onClick={onDelete}
            title="Delete document"
          >
            🗑
          </button>
        </div>
      </div>

      <div className="doc-card-body">
        <h3 className="doc-name" title={document.originalName}>{document.originalName}</h3>
        <div className="doc-meta">
          <span>{formatBytes(document.fileSize)}</span>
          <span>·</span>
          <span>{formatDate(document.uploadDate)}</span>
        </div>
      </div>

      <div className="doc-card-actions">
        <button id={`chat-btn-${document._id}`} className="btn btn-secondary btn-sm" onClick={onChat}>
          💬 Ask AI
        </button>
        <button id={`flashcard-btn-${document._id}`} className="btn btn-secondary btn-sm" onClick={onFlashcards}>
          🃏 Flashcards
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
