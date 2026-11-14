import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetails } from '../services/tmdb';
import { sanitize } from '../utils/sanitize';
import { LangContext } from '../context/LangContext';
import { getPlayLink } from '../config/playLinks';
import { buildDetailUrl } from '../utils/buildDetailUrl';
import { SITE_URL, SUPPORTED_LANGS } from '../config/site';
import NotFound from './NotFound';

const getPlayButtonText = (langCode) => {
  const map = {
    en: 'Watch', fr: 'Regarder', ja: '視聴する', ko: '시청하기',
    de: 'Ansehen', it: 'Guarda', nl: 'Kijken', es: 'Ver',
    pt: 'Assistir', id: 'Tonton', zh: '观看', hi: 'देखें', hu: 'Nézés'
  };
  return map[langCode?.toLowerCase()] || 'Watch';
};

/** Extract numeric ID from param like "550" or "550-fight-club" */
const parseIdParam = (raw) => {
  const m = raw ? raw.match(/^(\d+)(?:-(.*))?$/) : null;
  return m ? { numericId: m[1], slugPart: m[2] || '' } : null;
};

const Detail = () => {
  const { langCode, type, id: idParam } = useParams();
  const navigate = useNavigate();
  const { lang, changeLang } = useContext(LangContext);

  // Parse numeric ID from slug param
  const parsed = parseIdParam(idParam);
  const numericId = parsed?.numericId;

  // Validate type and id upfront (render-phase, before hooks)
  const isInvalidRoute = !['movie', 'tv'].includes(type) || !numericId;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(!isInvalidRoute);
  const [error, setError] = useState(null);
  const prevLangRef = useRef(lang);

  // Sync langCode URL param → context (only if different)
  useEffect(() => {
    if (langCode && langCode !== lang.split('-')[0]) {
      changeLang(langCode);
    }
  }, [langCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect lang switch on detail page → new slug URL
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    // item may not be loaded yet; let the fetch effect handle redirect after load
    if (item) {
      const title = item.title || item.name;
      const newUrl = buildDetailUrl(
        lang.split('-')[0],
        type,
        numericId,
        title,
        item.original_title || item.original_name
      );
      navigate(newUrl, { replace: true });
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch detail data
  useEffect(() => {
    if (isInvalidRoute) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDetails(numericId, type, lang);
        if (cancelled) return;
        setItem(data);

        // Canonical slug check — if URL slug doesn't match, redirect
        const canonicalUrl = buildDetailUrl(
          lang.split('-')[0],
          type,
          numericId,
          data.title || data.name,
          data.original_title || data.original_name
        );
        const currentPath = window.location.pathname;
        if (currentPath !== canonicalUrl) {
          navigate(canonicalUrl, { replace: true });
        }
      } catch {
        if (!cancelled) setError('Failed to fetch details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [numericId, type, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isInvalidRoute) return <NotFound />;
  if (loading) return <div className="container" style={{ paddingTop: '50px' }}>Loading...</div>;
  if (error || !item) return <NotFound />;

  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : '';
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '/placeholder-poster.svg';
  const posterUrlFull = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : `${SITE_URL}/placeholder-poster.svg`;

  const title = item.title || item.name;
  const safeTitle = sanitize(title);
  const rawOverview = item.overview || '';
  const safeOverview = sanitize(rawOverview || 'No synopsis available.');
  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);
  const releaseDate = item.release_date || item.first_air_date || '';
  const duration = item.runtime
    ? `${item.runtime} min`
    : (item.episode_run_time?.[0] ? `${item.episode_run_time[0]} min/ep` : '');

  const trailer = item.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  const language = item.spoken_languages?.length > 0
    ? item.spoken_languages[0].english_name
    : (item.original_language?.toUpperCase() || 'N/A');
  const country = item.production_countries?.length > 0
    ? item.production_countries[0].name
    : (item.origin_country?.[0] || 'N/A');

  const activeLang = (langCode || lang).split('-')[0];
  const canonicalUrl = buildDetailUrl(activeLang, type, numericId, title, item.original_title || item.original_name);
  const canonicalFull = `${SITE_URL}${canonicalUrl}`;

  // Meta description: max 155 chars from overview, fallback generic
  const rawDesc = rawOverview
    ? rawOverview.slice(0, 155) + (rawOverview.length > 155 ? '…' : '')
    : `Watch ${title} (${releaseYear}) on JackTV. Stream ${type === 'movie' ? 'the movie' : 'the series'} now.`;

  // JSON-LD schema
  const schemaType = type === 'movie' ? 'Movie' : 'TVSeries';
  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    description: rawOverview || rawDesc,
    image: posterUrlFull,
    datePublished: releaseDate,
    ...(item.vote_count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: item.vote_average?.toFixed(1),
        voteCount: item.vote_count,
        bestRating: '10',
        worstRating: '1'
      }
    } : {})
  };

  return (
    <>
      {/* SEO meta tags — React 19 native */}
      <title>{`${title} (${releaseYear}) | JackTV`}</title>
      <meta name="description" content={rawDesc} />
      <link rel="canonical" href={canonicalFull} />

      {/* hreflang alternates */}
      {SUPPORTED_LANGS.map(l => {
        const altUrl = buildDetailUrl(l, type, numericId, title, item.original_title || item.original_name);
        const hreflangCode = l === 'en' ? 'en' : l === 'zh' ? 'zh-CN' : l === 'pt' ? 'pt-BR' : l;
        return <link key={l} rel="alternate" hrefLang={hreflangCode} href={`${SITE_URL}${altUrl}`} />;
      })}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${buildDetailUrl('en', type, numericId, title, item.original_title || item.original_name)}`} />

      {/* Open Graph */}
      <meta property="og:type" content={type === 'movie' ? 'video.movie' : 'video.tv_show'} />
      <meta property="og:title" content={`${title} (${releaseYear}) | JackTV`} />
      <meta property="og:description" content={rawDesc} />
      <meta property="og:image" content={posterUrlFull} />
      <meta property="og:url" content={canonicalFull} />
      <meta property="og:site_name" content="JackTV" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} (${releaseYear}) | JackTV`} />
      <meta name="twitter:description" content={rawDesc} />
      <meta name="twitter:image" content={posterUrlFull} />

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>

      {/* Page content */}
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
    </>
  );
};

export default Detail;
