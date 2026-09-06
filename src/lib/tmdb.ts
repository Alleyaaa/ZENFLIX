const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  credits: { cast: { id: number; name: string; profile_path: string; character: string }[] };
  similar: { results: TMDBMovie[] };
}

export interface TMDBTV {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  seasons: { id: number; name: string; season_number: number; episode_count: number; poster_path: string; air_date: string }[];
  credits: { cast: { id: number; name: string; profile_path: string; character: string }[] };
  similar: { results: TMDBTV[] };
}

async function fetchTmdb<T>(url: string): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${TMDB_BASE_URL}${url}${separator}api_key=${apiKey}&language=id-ID`;
  
  const res = await fetch(fullUrl, {
    next: { revalidate: 3600 }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch TMDB data: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export function tmdbImage(path: string | null, size: 'w92' | 'w185' | 'w342' | 'w500' | 'original') {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function getTrending(): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb('/trending/movie/week')
}

export async function getNowPlaying(page = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/movie/now_playing?page=${page}`)
}

export async function getPopular(page = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/movie/popular?page=${page}`)
}

export async function getTopRated(page = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/movie/top_rated?page=${page}`)
}

export async function getUpcoming(page = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/movie/upcoming?page=${page}`)
}

export async function getMovieDetail(id: number): Promise<TMDBMovie> {
  return fetchTmdb(`/movie/${id}?append_to_response=credits,similar`)
}

export async function getTVDetail(id: number): Promise<TMDBTV> {
  return fetchTmdb(`/tv/${id}?append_to_response=credits,similar`)
}

export async function getPopularTV(page = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/tv/popular?page=${page}`)
}

export async function searchMovies(query: string): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/search/movie?query=${encodeURIComponent(query)}`)
}

export async function getGenres(): Promise<{ genres: { id: number; name: string }[] }> {
  return fetchTmdb('/genre/movie/list')
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<{ results: TMDBMovie[] }> {
  return fetchTmdb(`/discover/movie?with_genres=${genreId}&page=${page}`)
}
