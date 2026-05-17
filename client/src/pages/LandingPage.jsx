import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-icon">💬</span>
          <span className="logo-text">ChatSync</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/signup" className="nav-btn primary-btn">Sign up free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">✨ Now in public beta</div>
          <h1 className="hero-title">
            Real-Time Communication, <span className="highlight-text">Perfected.</span>
          </h1>
          <p className="hero-subtitle">
            Experience seamless, lightning-fast messaging with our modern platform. 
            Connect with your team instantly, beautifully, and securely.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="hero-btn primary-btn pulse-glow">Get Started Free</Link>
            <a href="#features" className="hero-btn secondary-btn">Explore Features</a>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">&lt;50ms</span>
              <span className="stat-label">Latency</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">256-bit</span>
              <span className="stat-label">Encryption</span>
            </div>
          </div>
        </div>

        {/* Decorative elements for the hero */}
        <div className="hero-visuals">
          <div className="glass-card chat-preview card-1">
            <div className="chat-header">
              <div className="avatar"></div>
              <div className="user-info">
                <div className="name">Sarah Jenkins</div>
                <div className="status">Online</div>
              </div>
            </div>
            <div className="chat-body">
              <div className="message received">Hey! Did you check out the new design?</div>
              <div className="message sent">Yes, it looks absolutely stunning! ✨</div>
            </div>
          </div>
          
          <div className="glass-card chat-preview card-2">
            <div className="notification-content">
              <span className="bell-icon">🔔</span>
              <div>
                <div className="notif-title">New Message</div>
                <div className="notif-desc">Alex just sent you a file.</div>
              </div>
            </div>
          </div>

          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
      </main>
      
      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Why choose ChatSync?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Built on WebSockets for true real-time, zero-latency communication.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Modern Design</h3>
            <p>A beautiful, glassmorphic UI that feels premium and responsive.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your messages are yours. We ensure top-tier privacy standards.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">ChatSync</div>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} ChatSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
