import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentContext';
import UploadZone from '../components/UploadZone';
import DocumentCard from '../components/DocumentCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getFlashcards } from '../api/flashcard.api';
import { getChatHistory } from '../api/chat.api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { documents, loading, fetchDocuments, deleteDocument } = useDocuments();
  const [stats, setStats] = useState({ docs: 0, flashcards: 0, queries: 0 });
  const [showUpload, setShowUpload] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  useEffect(() => {
    if (documents.length === 0) {
      setStats({ docs: 0, flashcards: 0, queries: 0 });
      return;
    }
    const fetchStats = async () => {
      let flashcards = 0, queries = 0;
      await Promise.all(documents.map(async (doc) => {
        try {
          const [fc, ch] = await Promise.all([
            getFlashcards(doc._id),
            getChatHistory(doc._id),
          ]);
          flashcards += fc.data.flashcards.length;
          queries += ch.data.messages.filter(m => m.role === 'user').length;
        } catch {}
      }));
      setStats({ docs: documents.length, flashcards, queries });
    };
    fetchStats();
  }, [documents]);

  const handleDeleteClick = (id) => {
    setConfirmState({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteDocument(confirmState.id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
      setConfirmState({ open: false, id: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmState({ open: false, id: null });
  };

  const formatBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard <span className="gradient-text">🗯️</span></h1>
          <p style={{ marginTop: 4 }}>Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong></p>
        </div>
        <button id="upload-trigger-btn" className="btn btn-primary" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card"><div className="stat-value">{stats.docs}</div><div className="stat-label">Documents</div></div>
        <div className="stat-card"><div className="stat-value">{stats.flashcards}</div><div className="stat-label">Flashcards</div></div>
        <div className="stat-card"><div className="stat-value">{stats.queries}</div><div className="stat-label">AI Queries</div></div>
        <div className="stat-card"><div className="stat-value">{5 - stats.docs}</div><div className="stat-label">Slots Remaining</div></div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <UploadZone onSuccess={() => { setShowUpload(false); fetchDocuments(); }} />
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmState.open}
        title="Delete Document"
        message="This will permanently delete the document along with all its chat history and flashcards. This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger
      />

      {/* Document Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <p>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No documents yet</h3>
          <p>Upload a PDF or text file to get started</p>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>Upload your first document</button>
        </div>
      ) : (
        <div className="doc-grid">
          {documents.map(doc => (
            <DocumentCard
              key={doc._id}
              document={doc}
              formatBytes={formatBytes}
              onDelete={() => handleDeleteClick(doc._id)}
              onChat={() => navigate(`/chat/${doc._id}`)}
              onFlashcards={() => navigate(`/flashcards/${doc._id}`)}
              deleting={deleting && confirmState.id === doc._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
