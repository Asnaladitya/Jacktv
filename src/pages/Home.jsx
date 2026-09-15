import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrending, searchMedia } from '../services/tmdb';
import MediaCard from '../components/MediaCard';
import { LangContext } from '../context/LangContext';

const Home = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [activeTab, setActiveTab] = useState('movie'); // 'movie' or 'tv'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { lang } = useContext(LangContext);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (query) {
          // If there's a search query, fetch search results
          data = await searchMedia(query, activeTab, lang);
        } else {
          // Otherwise fetch trending
          data = await getTrending(activeTab, lang);
        }
        setItems(data.results || []);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [activeTab, query, lang]);

  return (
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
  );
};

export default Home;
