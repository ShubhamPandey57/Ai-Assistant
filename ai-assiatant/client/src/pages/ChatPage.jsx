import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument } from '../api/document.api';
import { getChatHistory, clearChatHistory } from '../api/chat.api';
import { askQuestion, summarize } from '../api/ai.api';
import ReactMarkdown from 'react-markdown';
import './ChatPage.css';

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Summary panel state
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryFormat, setSummaryFormat] = useState('bullets');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, chatRes] = await Promise.all([
          getDocument(documentId),
          getChatHistory(documentId),
        ]);
        setDocument(docRes.data.document);
        setMessages(chatRes.data.messages || []);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchData();
  }, [documentId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const recentHistory = messages.slice(-8); // last 8 messages for context
      const res = await askQuestion({ documentId, question, history: recentHistory });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ Error: ${err.response?.data?.message || 'Failed to get response.'}` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSummarize = async () => {
    setSummaryError('');
    setSummary('');
    setSummaryLoading(true);
    try {
      const res = await summarize({ documentId, format: summaryFormat });
      setSummary(res.data.summary);
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear all chat history for this document?')) return;
    await clearChatHistory(documentId);
    setMessages([]);
  };

  if (loadingHistory) {
    return <div className="empty-state"><div className="spinner" style={{ width: 36, height: 36 }} /><p>Loading chat...</p></div>;
  }

  return (
    <div className="chat-page">
      {/* Main chat area */}
      <div className={`chat-main ${summaryOpen ? 'with-panel' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
            <div>
              <h2 className="chat-doc-title">{document?.originalName}</h2>
              <p className="chat-doc-size">{messages.length} messages</p>
            </div>
          </div>
          <div className="chat-header-actions">
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleClearChat} title="Clear history">🗑 Clear</button>
            )}
            <button
              id="summary-toggle-btn"
              className={`btn btn-sm ${summaryOpen ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSummaryOpen(p => !p)}
            >
              ✦ {summaryOpen ? 'Hide' : 'Summarize'}
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">💬</div>
              <h3>Ask anything about this document</h3>
              <p>I'll answer based on the content of <strong>{document?.originalName}</strong></p>
              <div className="chat-suggestions">
                {['Summarize the main topics', 'What are the key points?', 'Explain the most important concept'].map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble assistant typing">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-textarea"
            rows={1}
            placeholder="Ask a question about this document..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button id="chat-send-btn" className="btn btn-primary chat-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? <span className="spinner" /> : '↑'}
          </button>
        </div>
      </div>

      {/* Summary Panel */}
      {summaryOpen && (
        <div className="summary-panel">
          <div className="summary-panel-header">
            <h3>✦ Summary</h3>
          </div>
          <div className="format-selector">
            {[
              { key: 'bullets', label: '• Bullets' },
              { key: 'paragraph', label: '¶ Paragraph' },
              { key: 'detailed', label: '≡ Detailed' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`format-btn ${summaryFormat === key ? 'active' : ''}`}
                onClick={() => setSummaryFormat(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button id="generate-summary-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSummarize} disabled={summaryLoading}>
            {summaryLoading ? <><span className="spinner" /> Generating...</> : 'Generate Summary'}
          </button>
          {summaryError && <div className="alert alert-error" style={{ marginTop: 12 }}>{summaryError}</div>}
          {summary && (
            <div className="summary-result">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
