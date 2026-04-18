import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument } from '../api/document.api';
import { getFlashcards, updateFlashcard, deleteFlashcard } from '../api/flashcard.api';
import { generateFlashcards } from '../api/ai.api';
import './FlashcardsPage.css';

const FlashcardsPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, cardsRes] = await Promise.all([
          getDocument(documentId),
          getFlashcards(documentId),
        ]);
        setDocument(docRes.data.document);
        setCards(cardsRes.data.flashcards);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [documentId, navigate]);

  const handleGenerate = async () => {
    setGenError('');
    setGenerating(true);
    try {
      const res = await generateFlashcards({ documentId });
      setCards(prev => [...res.data.flashcards, ...prev]);
    } catch (err) {
      setGenError(err.response?.data?.message || 'Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flashcard?')) return;
    await deleteFlashcard(id);
    setCards(prev => prev.filter(c => c._id !== id));
  };

  const startEdit = (card) => {
    setEditingId(card._id);
    setEditForm({ question: card.question, answer: card.answer });
  };

  const saveEdit = async (id) => {
    const res = await updateFlashcard(id, editForm);
    setCards(prev => prev.map(c => c._id === id ? res.data.flashcard : c));
    setEditingId(null);
  };

  if (loading) {
    return <div className="empty-state"><div className="spinner" style={{ width: 36, height: 36 }} /><p>Loading flashcards...</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1>Flashcards</h1>
            <p style={{ fontSize: '0.8rem', marginTop: 2 }}>{document?.originalName}</p>
          </div>
        </div>
        <button
          id="generate-flashcards-btn"
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? <><span className="spinner" /> Generating...</> : '✦ Generate Flashcards'}
        </button>
      </div>

      {genError && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠ {genError}</div>}

      {cards.length === 0 && !generating ? (
        <div className="empty-state">
          <div className="empty-state-icon">🃏</div>
          <h3>No flashcards yet</h3>
          <p>Click "Generate Flashcards" to create AI-powered study cards from this document</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {cards.length} flashcard{cards.length !== 1 ? 's' : ''} · Click a card to flip it
          </p>
          <div className="flashcard-grid">
            {cards.map(card => (
              <FlashCard
                key={card._id}
                card={card}
                isEditing={editingId === card._id}
                editForm={editForm}
                onEditFormChange={setEditForm}
                onStartEdit={() => startEdit(card)}
                onSaveEdit={() => saveEdit(card._id)}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => handleDelete(card._id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FlashCard = ({ card, isEditing, editForm, onEditFormChange, onStartEdit, onSaveEdit, onCancelEdit, onDelete }) => {
  const [flipped, setFlipped] = useState(false);

  if (isEditing) {
    return (
      <div className="flashcard-edit">
        <div className="form-group">
          <label className="form-label">Question</label>
          <textarea
            className="input"
            rows={3}
            value={editForm.question}
            onChange={e => onEditFormChange(p => ({ ...p, question: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Answer</label>
          <textarea
            className="input"
            rows={3}
            value={editForm.answer}
            onChange={e => onEditFormChange(p => ({ ...p, answer: e.target.value }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={onSaveEdit}>Save</button>
          <button className="btn btn-ghost btn-sm" onClick={onCancelEdit}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flashcard-container ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(p => !p)}>
      <div className="flashcard-inner">
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-label">Question</div>
          <p className="flashcard-text">{card.question}</p>
          <p className="flashcard-hint">Click to reveal answer</p>
        </div>
        <div className="flashcard-face flashcard-back">
          <div className="flashcard-label">Answer</div>
          <p className="flashcard-text">{card.answer}</p>
        </div>
      </div>
      <div className="flashcard-actions" onClick={e => e.stopPropagation()}>
        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={onStartEdit}>✎</button>
        <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={onDelete}>🗑</button>
      </div>
    </div>
  );
};

export default FlashcardsPage;
