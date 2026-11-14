const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '2rem 1rem',
      marginTop: '4rem',
      textAlign: 'center',
      color: '#888',
      fontSize: '0.85rem'
    }}>
      <div className="container">
        <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

