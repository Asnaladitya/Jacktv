import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <>
      <title>404 Not Found | JackTV</title>
      <meta name="robots" content="noindex" />
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--accent-color)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-play" style={{ display: 'inline-block' }}>
          Back to Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
