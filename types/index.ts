// types/index.ts

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    vote_average: number;
    release_date: string;
    genre_ids: number[];
  }
  
  export interface Series {
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    vote_average: number;
    first_air_date: string;
    genre_ids: number[];
  }
  
  export interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }
  
  export interface MediaDetails extends Movie {
    credits: {
      cast: Cast[];
    };
  }
  
  export type UserData = {
    id: string;
    email: string;
    favorites: number[];
    watchlist: number[];
    recentlyViewed: number[];
  };