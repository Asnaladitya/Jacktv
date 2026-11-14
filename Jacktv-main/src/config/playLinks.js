/**
 * ============================================================
 * FILE KONFIGURASI LINK TONTON PER FILM / TV SHOW
 * ============================================================
 *
 * CARA PAKAI:
 * - Secara default, SEMUA tombol tonton mengarah ke DEFAULT_PLAY_URL.
 *
 * - Jika ingin film TERTENTU mengarah ke link yang berbeda,
 *   tambahkan entry di dalam objek `playLinks` dengan format:
 *     "type-TMDB_ID": "https://link-khusus-anda"
 *
 *   Contoh: /detail/movie/550  →  key: "movie-550"
 * ============================================================
 */

// 🔗 Link default untuk SEMUA film dan serial
const DEFAULT_PLAY_URL = "https://reelspacex.blogspot.com";

const playLinks = {
  // Tambahkan link khusus per film di sini jika diperlukan.
  // Jika kosong, semua film diarahkan ke DEFAULT_PLAY_URL.

  // Contoh (hapus // untuk mengaktifkan):
  // "movie-550": "https://link-khusus-untuk-film-ini.com",
  // "tv-1396":   "https://link-khusus-untuk-serial-ini.com",
};

/**
 * Ambil link tonton untuk film/serial tertentu.
 * @param {string} type - "movie" atau "tv"
 * @param {number|string} id - TMDB ID
 * @returns {string} URL streaming
 */
export const getPlayLink = (type, id) => {
  const key = `${type}-${id}`;
  return playLinks[key] || DEFAULT_PLAY_URL;
};
