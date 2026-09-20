import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '../services/tmdb';
import { sanitize } from '../utils/sanitize';
import { LangContext } from '../context/LangContext';
import { getPlayLink } from '../config/playLinks';

const getPlayButtonText = (langCode) => {
  const map = {
    en: 'Watch',
    fr: 'Regarder',
    ja: '視聴する',
    ko: '시청하기',
    de: 'Ansehen',
    it: 'Guarda',
    nl: 'Kijken',
    es: 'Ver',
    pt: 'Assistir',
    id: 'Tonton',
    zh: '观看',
    hi: 'देखें',
    hu: 'Nézés'
  };
  return map[langCode?.toLowerCase()] || 'Watch';
};

const Detail = () => {
  const { langCode, type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { lang, changeLang } = useContext(LangContext);

  useEffect(() => {
    // If the URL has a language code, update the global context so it matches
    if (langCode && langCode !== lang.split('-')[0]) {
      // Find the corresponding long format for TMDB (e.g., 'fr-FR' or just use the short one if not mapped)
      changeLang(langCode);
    }
  }, [langCode, changeLang, lang]);

  useEffect(() => {
    // 1. Validate parameters (must be a number and type must be movie or tv)
    if (!['movie', 'tv'].includes(type) || !/^\d+$/.test(id)) {
      navigate('/');
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getDetails(id, type, lang);
        setItem(data);
      } catch (err) {
        setError('Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, type, navigate, lang]);

  if (loading) return <div className="container" style={{paddingTop: '50px'}}>Loading...</div>;
  if (error || !item) return <div className="container" style={{paddingTop: '50px'}}>{error || 'Not found'}</div>;

  const backdropUrl = item.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
    : '';
  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  const title = item.title || item.name;
  const safeTitle = sanitize(title);
  const safeOverview = sanitize(item.overview || 'No synopsis available.');
  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);
  const duration = item.runtime ? `${item.runtime} min` : (item.episode_run_time?.[0] ? `${item.episode_run_time[0]} min/ep` : '');
  
  // Find trailer
  const trailer = item.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  
  // Language & Country
  const language = item.spoken_languages?.length > 0 
    ? item.spoken_languages[0].english_name 
    : (item.original_language?.toUpperCase() || 'N/A');
    
  const country = item.production_countries?.length > 0 
    ? item.production_countries[0].name 
    : (item.origin_country?.[0] || 'N/A');

  return (
    <div>
      <div 
        className="detail-hero" 
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="detail-overlay"></div>
      </div>
      
      <div className="container">
        <div className="detail-content" style={{ marginTop: '-40vh' }}>
          <img src={posterUrl} alt={safeTitle} className="detail-poster" />
          
          <div className="detail-info">
            <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>{safeTitle}</h1>
            
            <div className="detail-meta">
              <span>{releaseYear}</span>
              {duration && <span>• {duration}</span>}
              <span>• {item.original_language?.toUpperCase()}</span>
              <span className="rating-badge">• ★ {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
            
            <div style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {item.genres?.map(g => (
                <span key={g.id} style={{ padding: '0.2rem 0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.9rem' }}>
                  {g.name}
                </span>
              ))}
            </div>

            <div className="action-buttons">
              <a href={getPlayLink(type, item.id)} className="btn-play" target="_blank" rel="noopener noreferrer">
                {getPlayButtonText(lang.split('-')[0])}
              </a>
              {trailerUrl && (
                <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="btn-trailer">Trailer</a>
              )}
            </div>

            <div className="extra-info">
              <p><strong>Original Language:</strong> {language}</p>
              <p><strong>Country:</strong> {country}</p>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Synopsis</h3>
            <p className="detail-synopsis">{safeOverview}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
