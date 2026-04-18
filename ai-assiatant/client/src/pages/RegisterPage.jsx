import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, isAdminMode, isAdminMode ? form.adminId : null);
      navigate(isAdminMode ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Side - Graphic/Brand */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-header">
            <p>Global learning made simple – AI study solutions for you.</p>
          </div>
          
          <div className="auth-left-main">
            <h1>Start<br />your journey</h1>
            
            {/* Phone Mockup Representation */}
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="phone-header">
                  <span className="date">Week 4-10 July</span>
                  <div className="icon-calendar"></div>
                </div>
                <div className="balance">
                  <span className="amount">897.00</span>
                  <span className="currency">pts</span>
                </div>
                <div className="chart">
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '50%'}}></div>
                  <div className="bar highlight" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '70%'}}></div>
                  <div className="bar" style={{height: '90%'}}></div>
                </div>
                <div className="category-section">
                  <span className="cat-title">Category</span>
                  <span className="cat-amount">950.00</span>
                </div>
                <div className="widgets">
                  <div className="widget-box light"></div>
                  <div className="widget-box dark"></div>
                  <div className="widget-box darkest"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-left-footer">
            <div className="accessibility-icon">
              <span>⧓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        <div className="auth-right-content">
          <div className="auth-right-header">
            <Link to="/" className="auth-logo-modern" style={{ textDecoration: 'none' }}>
              <div className="circle-logo"></div>
              <span className="logo-text">StudyAI</span>
            </Link>
            <Link to="/login" className="auth-signup-link">
              <span className="user-icon">◎</span> Sign In
            </Link>
          </div>

          <div className="auth-form-container">
            <h2 className="auth-heading">Sign Up</h2>
            
            <div className="role-toggle-container">
              <button 
                className={`role-toggle-btn ${!isAdminMode ? 'active' : ''}`}
                type="button"
                onClick={() => setIsAdminMode(false)}
              >
                User
              </button>
              <button 
                className={`role-toggle-btn ${isAdminMode ? 'active' : ''}`}
                type="button"
                onClick={() => setIsAdminMode(true)}
              >
                Admin
              </button>
            </div>
            
            {error && <div className="alert alert-error" role="alert">⚠ {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-modern">
              <div className="form-group-modern">
                <input
                  id="reg-name"
                  type="text"
                  className="input-modern"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>

              <div className="form-group-modern">
                <input
                  id="reg-email"
                  type="email"
                  className="input-modern"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              {isAdminMode && (
                <div className="form-group-modern">
                  <input
                    id="reg-adminId"
                    type="text"
                    className="input-modern"
                    placeholder="Admin ID"
                    value={form.adminId}
                    onChange={e => setForm(p => ({ ...p, adminId: e.target.value }))}
                    required
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="form-group-modern">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="input-modern"
                  placeholder="Password (Min. 6 chars)"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="eye-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '👁' : '⏚'} 
                </button>
              </div>

              <button id="register-submit" type="submit" className="btn-modern-submit" disabled={loading}>
                {loading ? <><span className="spinner-modern" /></> : <><span>→</span> Create Account</>}
              </button>
            </form>
          </div>

          <div className="auth-right-footer">
            <div className="footer-links">
              <Link to="#">Contact Us</Link>
              <span className="lang-selector">English ⌄</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
