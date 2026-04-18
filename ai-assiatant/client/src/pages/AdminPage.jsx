import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getAdminStats, getAdminUsers, deleteAdminUser, 
  getAdminDocuments, deleteAdminDocument,
  getAdminFlashcards, updateAdminFlashcard, deleteAdminFlashcard,
  getAdminContacts, updateAdminContact, deleteAdminContact
} from '../api/admin.api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import './AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, id: null, name: null });
  const [deleting, setDeleting] = useState(false);
  const [editingFlashcardId, setEditingFlashcardId] = useState(null);
  const [editFlashcardForm, setEditFlashcardForm] = useState({ question: '', answer: '' });
  const [contacts, setContacts] = useState([]);
  const [replyingContactId, setReplyingContactId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/dashboard'); return; }
    loadData();
  }, [user, navigate, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'stats' || tab === 'users') {
        const [statsRes, usersRes] = await Promise.all([getAdminStats(), getAdminUsers()]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
      }
      if (tab === 'documents') {
        const docsRes = await getAdminDocuments();
        setDocuments(docsRes.data.documents);
      }
      if (tab === 'flashcards') {
        const fcRes = await getAdminFlashcards();
        setFlashcards(fcRes.data.flashcards);
      }
      if (tab === 'contacts') {
        const contactRes = await getAdminContacts();
        setContacts(contactRes.data.contacts);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteUser = (id, name) => {
    setConfirmState({ open: true, type: 'user', id, name });
  };

  const handleDeleteDoc = (id) => {
    setConfirmState({ open: true, type: 'document', id, name: null });
  };

  const handleDeleteFlashcard = (id) => {
    setConfirmState({ open: true, type: 'flashcard', id, name: null });
  };

  const handleDeleteContact = (id) => {
    setConfirmState({ open: true, type: 'contact', id, name: null });
  };

  const startReply = (contact) => {
    setReplyingContactId(contact._id);
    setReplyText(contact.adminReply || '');
  };

  const handleSendReply = async (id) => {
    try {
      const res = await updateAdminContact(id, { adminReply: replyText });
      setContacts(prev => prev.map(c => c._id === id ? res.data.contact : c));
      setReplyingContactId(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
    }
  };

  const startEditFlashcard = (fc) => {
    setEditingFlashcardId(fc._id);
    setEditFlashcardForm({ question: fc.question, answer: fc.answer });
  };

  const cancelEditFlashcard = () => {
    setEditingFlashcardId(null);
  };

  const saveEditFlashcard = async (id) => {
    try {
      const res = await updateAdminFlashcard(id, editFlashcardForm);
      setFlashcards(prev => prev.map(f => f._id === id ? res.data.flashcard : f));
      setEditingFlashcardId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      if (confirmState.type === 'user') {
        await deleteAdminUser(confirmState.id);
        setUsers(prev => prev.filter(u => u._id !== confirmState.id));
      } else if (confirmState.type === 'document') {
        await deleteAdminDocument(confirmState.id);
        setDocuments(prev => prev.filter(d => d._id !== confirmState.id));
      } else if (confirmState.type === 'flashcard') {
        await deleteAdminFlashcard(confirmState.id);
        setFlashcards(prev => prev.filter(f => f._id !== confirmState.id));
      } else if (confirmState.type === 'contact') {
        await deleteAdminContact(confirmState.id);
        setContacts(prev => prev.filter(c => c._id !== confirmState.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmState({ open: false, type: null, id: null, name: null });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const getDeleteMessage = () => {
    if (confirmState.type === 'user') return `Are you sure you want to delete user "${confirmState.name}"? All their documents and history will be permanently erased.`;
    if (confirmState.type === 'document') return 'Are you sure you want to delete this document? This action cannot be undone.';
    if (confirmState.type === 'flashcard') return 'Are you sure you want to delete this specific flashcard?';
    if (confirmState.type === 'contact') return 'Are you sure you want to delete this contact message?';
    return '';
  };

  return (
    <div>
      <ConfirmDialog
        isOpen={confirmState.open}
        title={`Delete ${confirmState.type ? confirmState.type.charAt(0).toUpperCase() + confirmState.type.slice(1) : ''}`}
        message={getDeleteMessage()}
        onConfirm={performDelete}
        onCancel={() => !deleting && setConfirmState({ open: false, type: null, id: null, name: null })}
        danger
      />
      <div className="page-header">
        <div>
          <h1>⚙ Admin Panel</h1>
          <p style={{ marginTop: 4 }}>Platform management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['stats', 'users', 'documents', 'flashcards', 'contacts'].map(t => (
          <button
            key={t}
            id={`admin-tab-${t}`}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'stats' ? '📊 Overview' : t === 'users' ? '👥 Users' : t === 'documents' ? '📄 Documents' : t === 'flashcards' ? '🃏 Flashcards' : '✉ Contacts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <>
          {/* Stats Tab */}
          {tab === 'stats' && stats && (
            <div>
              <div className="stats-bar" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Total Users</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalDocuments}</div><div className="stat-label">Total Documents</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalFlashcards}</div><div className="stat-label">Total Flashcards</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalAIQueries}</div><div className="stat-label">AI Queries</div></div>
                <div className="stat-card"><div className="stat-value">{stats.totalContacts}</div><div className="stat-label">Total Queries</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: stats.pendingContacts > 0 ? 'var(--error)' : 'var(--badge-success)' }}>{stats.pendingContacts}</div><div className="stat-label">Pending Response</div></div>
              </div>
              <div className="admin-info-card card">
                <h3 style={{ marginBottom: 12 }}>System Information</h3>
                <div className="admin-info-row"><span>Version</span><span>v1.0 MVP</span></div>
                <div className="admin-info-row"><span>AI Provider</span><span>Groq Llama 3 70B</span></div>
                <div className="admin-info-row"><span>Storage</span><span>Local /uploads</span></div>
                <div className="admin-info-row"><span>Max docs/user</span><span>5</span></div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Documents</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.isAdmin ? 'badge-success' : 'badge-txt'}`}>
                          {u.isAdmin ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td>{u.documentCount}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {!u.isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id, u.name)}>
                            🗑 Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="empty-state"><p>No users found</p></div>}
            </div>
          )}

          {/* Documents Tab */}
          {tab === 'documents' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc._id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doc.originalName}</td>
                      <td>{doc.userId?.name || '—'} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({doc.userId?.email})</span></td>
                      <td>
                        <span className={`badge ${doc.fileType === 'application/pdf' ? 'badge-pdf' : 'badge-txt'}`}>
                          {doc.fileType === 'application/pdf' ? 'PDF' : 'TXT'}
                        </span>
                      </td>
                      <td>{formatBytes(doc.fileSize)}</td>
                      <td>{formatDate(doc.uploadDate)}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoc(doc._id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {documents.length === 0 && <div className="empty-state"><p>No documents found</p></div>}
            </div>
          )}

          {/* Flashcards Tab */}
          {tab === 'flashcards' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Document Context</th>
                    <th style={{ width: '30%' }}>Question</th>
                    <th style={{ width: '35%' }}>Answer</th>
                    <th style={{ width: '15%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flashcards.map(fc => (
                    <tr key={fc._id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{fc.documentId?.originalName || '—'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fc.userId?.email || '—'}</div>
                      </td>
                      
                      {editingFlashcardId === fc._id ? (
                        <>
                          <td colSpan={2}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <textarea
                                className="input"
                                value={editFlashcardForm.question}
                                onChange={(e) => setEditFlashcardForm(p => ({ ...p, question: e.target.value }))}
                                rows={2}
                                placeholder="Edit Question"
                                style={{ width: '100%', resize: 'vertical' }}
                              />
                              <textarea
                                className="input"
                                value={editFlashcardForm.answer}
                                onChange={(e) => setEditFlashcardForm(p => ({ ...p, answer: e.target.value }))}
                                rows={2}
                                placeholder="Edit Answer"
                                style={{ width: '100%', resize: 'vertical' }}
                              />
                            </div>
                          </td>
                          <td style={{ verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                              <button className="btn btn-primary btn-sm" onClick={() => saveEditFlashcard(fc._id)}>Save</button>
                              <button className="btn btn-ghost btn-sm" onClick={cancelEditFlashcard}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{fc.question}</td>
                          <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{fc.answer}</td>
                          <td style={{ verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => startEditFlashcard(fc)}>✎ Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFlashcard(fc._id)}>🗑 Del</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {flashcards.length === 0 && <div className="empty-state"><p>No flashcards found</p></div>}
            </div>
          )}

          {/* Contacts Tab */}
          {tab === 'contacts' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Sender</th>
                    <th style={{ width: '25%' }}>Subject/Date</th>
                    <th style={{ width: '35%' }}>Message</th>
                    <th style={{ width: '20%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.subject}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</div>
                        <div style={{ marginTop: 4 }}>
                          <span className={`badge ${c.status === 'replied' ? 'badge-success' : 'badge-danger'}`}>
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{c.message}</div>
                        {c.adminReply && (
                          <div className="admin-reply-box">
                            <strong>Admin Reply:</strong>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{c.adminReply}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Replied on {formatDate(c.repliedAt)}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {replyingContactId === c._id ? (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <textarea
                                className="input"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                                placeholder="Type your reply..."
                                style={{ width: '100%', resize: 'vertical' }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleSendReply(c._id)}>Submit</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setReplyingContactId(null)}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => startReply(c)}>
                                {c.status === 'replied' ? '✎ Edit Reply' : '📨 Reply'}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteContact(c._id)}>🗑 Del</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && <div className="empty-state"><p>No contact messages found</p></div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
