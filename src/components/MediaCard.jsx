import { Link } from 'react-router-dom';
import { sanitize } from '../utils/sanitize';

const MediaCard = ({ item, type }) => {
  const imageUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster';
    
  const title = item.title || item.name;
  // Sanitize title just in case
  const safeTitle = sanitize(title);
  
  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <Link to={`/detail/${type}/${item.id}`} className="media-card">
      <img src={imageUrl} alt={safeTitle} className="media-poster" loading="lazy" />
      <div className="media-info">
        <h3 className="media-title">{safeTitle}</h3>
        <div className="media-meta">
          <span>{releaseYear}</span>
          <span className="rating-badge">★ {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MediaCard;
