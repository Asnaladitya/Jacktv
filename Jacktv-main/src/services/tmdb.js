import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Configure axios instance with default params
const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getTrending = async (type = 'movie', lang = 'en-US') => {
  try {
    const response = await apiClient.get(`/trending/${type}/day`, {
      params: { language: lang }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending:', error);
    throw error;
  }
};

export const searchMedia = async (query, type = 'movie', lang = 'en-US') => {
  try {
    const response = await apiClient.get(`/search/${type}`, {
      params: {
        query: query,
        include_adult: false,
        language: lang
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
};

export const getDetails = async (id, type = 'movie', lang = 'en-US') => {
  try {
    const response = await apiClient.get(`/${type}/${id}`, {
      params: {
        append_to_response: 'videos',
        language: lang
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching details:', error);
    throw error;
  }
};

export const getPopular = async (type = 'movie', page = 1, lang = 'en-US') => {
  try {
    const response = await apiClient.get(`/${type}/popular`, {
      params: { language: lang, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular:', error);
    throw error;
  }
};
