import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrending, searchMedia } from '../services/tmdb';
import MediaCard from '../components/MediaCard';
import { LangContext } from '../context/LangContext';
import { SITE_URL } from '../config/site';

const Home = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [activeTab, setActiveTab] = useState('movie');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { lang } = useContext(LangContext);

  useEffect(() => {
    let cancelled = false;
    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (query) {
          data = await searchMedia(query, activeTab, lang);
        } else {
          data = await getTrending(activeTab, lang);
        }
        if (!cancelled) setItems(data.results || []);
      } catch {
        if (!cancelled) setError('Failed to fetch data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMedia();
    return () => { cancelled = true; };
  }, [activeTab, query, lang]);

  const pageTitle = query
    ? `Search: ${query} | JackTV`
    : 'Trending Movies & TV Shows | JackTV';
  const metaDesc = 'Browse trending movies and TV shows. Watch the latest films and series with JackTV.';

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDesc} />
      {query
        ? <meta name="robots" content="noindex, follow" />
        : <link rel="canonical" href={`${SITE_URL}/`} />
      }
      <div className="container">
        <div style={{ marginTop: '2rem' }}>
          <h1 className="title-main">
            {query ? `Search results for "${query}"` : 'Trending Now'}
          </h1>
          
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'movie' ? 'active' : ''}`}
              onClick={() => setActiveTab('movie')}
            >
              Movies
            </button>
            <button 
              className={`tab ${activeTab === 'tv' ? 'active' : ''}`}
              onClick={() => setActiveTab('tv')}
            >
              TV Shows
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          {!loading && !error && items.length === 0 && (
            <p>No results found.</p>
          )}

          <div className="media-grid">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} type={activeTab} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
