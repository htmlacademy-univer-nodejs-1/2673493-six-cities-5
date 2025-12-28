export type UserType = 'pro' | 'обычный';

export type User = {
  name: string;
  email: string;
  avatarSrc?: string;
  password: string;
  type: UserType;
};

export enum City {
  Paris = 'Paris',
  Cologne = 'Cologne',
  Brussels = 'Brussels',
  Amsterdam = 'Amsterdam',
  Hamburg = 'Hamburg',
  Dusseldorf = 'Dusseldorf',
}
export enum HousingType {
  Apartment = 'apartment',
  House = 'house',
  Room = 'room',
  Hotel = 'hotel',
}
export enum Amenity {
  Breakfast = 'Breakfast',
  AirConditioning = 'Air conditioning',
  LaptopFriendlyWorkspace = 'Laptop friendly workspace',
  BabySeat = 'Baby seat',
  Washer = 'Washer',
  Towels = 'Towels',
  Fridge = 'Fridge',
}
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

export * from './component.enum.js';
