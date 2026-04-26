import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">🎓 UniComplaint</div>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>University <span>Complaint System</span></h1>
        <p>Submit, track, and resolve complaints efficiently. Ensuring every student voice is heard and every issue is addressed promptly.</p>
        <div className="hero-buttons">
          <Link href="/register" className="btn btn-primary btn-lg">Get Started</Link>
          <Link href="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
      </section>

      <section className="features">
        <div className="card feature-card">
          <div className="feature-icon">📝</div>
          <h3>Easy Submission</h3>
          <p>Submit complaints with detailed descriptions, categories, priorities, and file attachments.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📡</div>
          <h3>Real-Time Tracking</h3>
          <p>Track the status of your complaints from submission to resolution with live updates.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">👥</div>
          <h3>Role-Based Access</h3>
          <p>Students submit, staff manage, and admins oversee — each with a tailored dashboard.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📊</div>
          <h3>Analytics Dashboard</h3>
          <p>Administrators can view trends, resolution rates, and performance metrics at a glance.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Notifications</h3>
          <p>Stay informed with in-app notifications for status changes, responses, and assignments.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Feedback System</h3>
          <p>Rate and review complaint resolutions to help improve university services.</p>
        </div>
      </section>
    </div>
  );
}
