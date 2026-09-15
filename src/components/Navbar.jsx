import { useContext } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <header>
      <div className="container nav-container" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="logo">JackTV</Link>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
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
