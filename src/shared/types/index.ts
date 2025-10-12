export type UserType = 'pro' | 'обычный';

export type User = {
  name: string;
  email: string;
  avatarSrc?: string;
  password: string;
  type: UserType;
};

export type City =
  | 'Paris'
  | 'Cologne'
  | 'Brussels'
  | 'Amsterdam'
  | 'Hamburg'
  | 'Dusseldorf';
export type HousingType = 'apartment' | 'house' | 'room' | 'hotel';
export type Amenity =
  | 'Breakfast'
  | 'Air conditioning'
  | 'Laptop friendly workspace'
  | 'Baby seat'
  | 'Washer'
  | 'Towels'
  | 'Fridge';
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Offer = {
  name: string;
  description: string;
  publicationDate: Date;
  city: City;
  previewSrc: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HousingType;
  bedroomsCount: number;
  guestCount: number;
  price: number;
  amenities: Amenity[];
  host: User;
  commentsCount: number;
  coordinates: Coordinates;
};

export type Comment = {
  text: string;
  publicationDate: Date;
  rating: number;
  user: User;
};
