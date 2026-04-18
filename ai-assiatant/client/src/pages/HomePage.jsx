import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import heroImage from '../assets/home_hero.png';

const HomePage = () => {
  const { user } = useAuth();
  
  // Smooth scroll helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-layout">
      {/* ── NAVBAR ── */}
      <nav className="home-navbar">
        <Link to="/" className="home-logo-modern">
          <div className="circle-logo-home"></div>
          <span className="logo-text-home">StudyAI</span>
        </Link>
        
        <div className="home-nav-links">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="nav-anchor">Home</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="nav-anchor">Features</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="nav-anchor">About</a>
          <Link to="/contact" className="nav-anchor">Contact</Link>
        </div>
        
        <div className="home-nav-actions">
          {user ? (
            <Link to="/dashboard" className="btn-signup-home">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-login-home">Log In</Link>
              <Link to="/register" className="btn-signup-home">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section id="home" className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">Next-Gen Learning</div>
          <h1>Manage your learning with <span className="hero-gradient-text">AI</span></h1>
          <p>
            Global learning made simple. Transform your study materials into interactive flashcards and converse seamlessly with your documents using advanced AI solutions built for you.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn-primary-home">Go to Dashboard</Link>
            ) : (
              <Link to="/register" className="btn-primary-home"><span>→</span> Get Started Free</Link>
            )}
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="btn-secondary-home">Explore Features</a>
          </div>
        </div>
        <div className="hero-visual">
          <img src={heroImage} alt="AI Study Assistant Mockup" className="hero-image" />
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="home-section">
        <div className="section-header">
          <h2>Powerful <span className="hero-gradient-text">Features</span></h2>
          <p>Everything you need to master your subjects, all in one intelligent platform.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📑</div>
            <h3>Smart Document Management</h3>
            <p>Upload your PDFs, Word documents, and text files. Our AI automatically parses and organizes your study material into highly accessible formats.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📇</div>
            <h3>AI Flashcard Generation</h3>
            <p>Don't waste time making flashcards manually. We extract key concepts and instantly generate interactive flashcards to test your knowledge.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Interactive Document Chat</h3>
            <p>Have a question about Chapter 4? Just ask! Our AI reads your document and provides precise answers with contextual understanding.</p>
          </div>
        </div>
      </section>

      {/* ── ABOUT & CONTACT SECTION ── */}
      <section id="about" className="home-section" style={{ paddingTop: 0 }}>
        <div className="about-contact-wrapper">
          <div className="about-box">
            <h3>About StudyAI</h3>
            <p>
              StudyAI was born out of a simple idea: students spend too much time organizing and not enough time learning. By leveraging large language models, we built an assistant that processes your syllabus and lectures to help you focus on mastering the material.
            </p>
            <p>
              Whether you are preparing for standard exams or learning a new language, StudyAI adapts to your unique learning style.
            </p>
          </div>
          
          <div id="contact" className="contact-box">
            <h3>Contact Us</h3>
            <p>Have questions, feedback, or want to explore enterprise solutions? We'd love to hear from you.</p>
            <div style={{ marginBottom: '20px' }}>
              <Link to="/contact" className="btn btn-primary">
                dY' Get in Touch
              </Link>
            </div>
            <ul className="contact-info">
              <li><span>?</span> Email: <a href="mailto:hello@studyai.com" style={{ color: 'inherit' }}>hello@studyai.com</a></li>
              <li><span>?</span> Phone: <a href="tel:+18001234567" style={{ color: 'inherit' }}>+1 (800) 123-4567</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div>© {new Date().getFullYear()} StudyAI Inc. All rights reserved.</div>
        <div className="footer-links-home">
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Back to Top</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
