/**
 * Slugify a title: lowercase, strip accents, replace non-alphanumeric with dash,
 * collapse and trim dashes, limit to ~80 chars.
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accent combining chars
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')       // non-alphanumeric → dash
    .replace(/^-+|-+$/g, '')           // trim leading/trailing dashes
    .replace(/-{2,}/g, '-')            // collapse multiple dashes
    .slice(0, 80)
    .replace(/-+$/, '');               // trim trailing dash after slice
};
