export interface User {
  id: number;
  username: string;
  email: string;
  tag_name?: string;
  bio?: string;
  location?: string;
  crew?: string;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
}

export interface Piece {
  id: number;
  title: string;
  description?: string;
  piece_type: PieceType;
  surface: Surface;
  location?: string;
  is_public: boolean;
  image_url: string;
  thumbnail_url?: string;
  artist_id: number;
  created_at: string;
  artist: User;
}

export interface PieceWithStats extends Piece {
  likes_count: number;
  comments_count: number;
  is_liked_by_user: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  piece_id: number;
  created_at: string;
  author: User;
}

export type PieceType = 
  | 'tag'
  | 'throwie'
  | 'hollow'
  | 'straight_letter'
  | 'piece'
  | 'blockbuster'
  | 'wildstyle'
  | 'stencil'
  | 'wheatpaste'
  | 'sticker'
  | 'digital'
  | 'sketch';

export type Surface = 
  | 'wall'
  | 'train'
  | 'canvas'
  | 'blackbook'
  | 'digital'
  | 'sticker'
  | 'poster'
  | 'other';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}