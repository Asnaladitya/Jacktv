import { useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { LangContext } from '../context/LangContext';

const langs = [
  { code: 'en', label: 'EN' },
  { code: 'id', label: 'ID' },
  { code: 'fr', label: 'FR' },
  { code: 'ja', label: 'JA' },
  { code: 'ko', label: 'KO' },
  { code: 'de', label: 'DE' },
  { code: 'es', label: 'ES' },
  { code: 'it', label: 'IT' },
  { code: 'pt', label: 'PT' },
  { code: 'hu', label: 'HU' }
];

const Navbar = () => {
  const { lang, changeLang } = useContext(LangContext);
  const params = useParams();
  const navigate = useNavigate();

  const handleLangChange = (newLang) => {
    changeLang(newLang);

    // If we're on a detail page, navigate to new lang slug URL
    // params will have langCode, type, id if on /:langCode/:type/:id route
    const { langCode, type, id: idParam } = params;
    if (langCode && type && idParam && ['movie', 'tv'].includes(type)) {
      const m = idParam.match(/^(\d+)(?:-(.*))?$/);
      if (m) {
        const numericId = m[1];
        // We don't have item data here, so navigate to bare id — Detail.jsx will
        // redirect to canonical slug after fetching
        navigate(`/${newLang}/${type}/${numericId}`, { replace: true });
      }
    }
    // For other pages, context change is enough
  };

  return (
    <header>
      <div className="container nav-container" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="logo">JackTV</Link>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              className={`lang-btn ${lang === l.code ? 'active' : ''}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <SearchBar />
      </div>
    </header>
  );
};

export default Navbar;
