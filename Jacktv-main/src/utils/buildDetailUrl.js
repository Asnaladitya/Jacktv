import { slugify } from './slugify';

/**
 * Build a canonical detail URL.
 * @param {string} lang - short lang code (e.g. 'en', 'it')
 * @param {string} type - 'movie' or 'tv'
 * @param {string|number} id - TMDB numeric ID
 * @param {string} title - title in the active language (may be non-Latin)
 * @param {string} [originalTitle] - fallback original_title from TMDB
 * @param {string} [englishTitle] - fallback English title
 * @returns {string} e.g. '/en/movie/550-fight-club'
 */
export const buildDetailUrl = (lang, type, id, title, originalTitle = '', englishTitle = '') => {
  let slug = slugify(title);
  if (!slug) slug = slugify(originalTitle);
  if (!slug) slug = slugify(englishTitle);
  // If still empty (all non-Latin), use ID only
  const path = slug ? `/${lang}/${type}/${id}-${slug}` : `/${lang}/${type}/${id}`;
  return path;
};
