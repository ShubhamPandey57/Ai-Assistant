import { useDocuments } from '../context/DocumentContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import UploadZone from '../components/UploadZone';
import { ConfirmDialog } from '../components/ConfirmDialog';

const DocumentsPage = () => {
  const { documents, loading, fetchDocuments, deleteDocument } = useDocuments();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

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

  const filtered = documents.filter(d =>
    d.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const getFileLabel = (fileType) => {
    const map = {
      'application/pdf': { label: 'PDF', cls: 'badge-pdf' },
      'text/plain': { label: 'TXT', cls: 'badge-txt' },
      'application/msword': { label: 'DOC', cls: 'badge-doc' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', cls: 'badge-doc' },
      'application/vnd.ms-excel': { label: 'XLS', cls: 'badge-excel' },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', cls: 'badge-excel' },
      'application/vnd.ms-powerpoint': { label: 'PPT', cls: 'badge-ppt' },
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PPTX', cls: 'badge-ppt' },
    };
    return map[fileType] || { label: 'FILE', cls: 'badge-txt' };
  };
  const formatBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <h1>Documents</h1>
        <span className="badge badge-success">{documents.length} / 5</span>
      </div>

      <UploadZone onSuccess={fetchDocuments} />

      {/* Custom Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmState.open}
        title="Delete Document"
        message="This will permanently delete the document and all its associated chat history and flashcards. This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmState({ open: false, id: null })}
        danger
      />

      <div style={{ marginTop: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <input
            id="doc-search"
            type="text"
            className="input"
            placeholder="🔍  Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /><p>Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>{search ? 'No documents match your search' : 'No documents yet. Upload one above!'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const f = getFileLabel(doc.fileType);
                  const isDeleting = deleting && confirmState.id === doc._id;
                  return (
                    <tr key={doc._id} style={{ opacity: isDeleting ? 0.5 : 1 }}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doc.originalName}</td>
                      <td><span className={`badge ${f.cls}`}>{f.label}</span></td>
                      <td>{formatBytes(doc.fileSize)}</td>
                      <td>{formatDate(doc.uploadDate)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/chat/${doc._id}`)}>💬 Chat</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/flashcards/${doc._id}`)}>🃏 Cards</button>
                          <button
                            id={`delete-doc-${doc._id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteClick(doc._id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? '...' : '🗑'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
