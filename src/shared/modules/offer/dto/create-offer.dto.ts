import { Amenity, City, Coordinates, HousingType } from '../../../types/index.js';

export class CreateOfferDto {
  public name!: string;
  public description!: string;
  public publicationDate!: Date;
  public city!: City;
  public previewSrc!: string;
  public images!: string[];
  public isPremium!: boolean;
  public isFavorite!: boolean;
  public rating!: number;
  public type!: HousingType;
  public bedroomsCount!: number;
  public guestCount!: number;
  public price!: number;
  public amenities!: Amenity[];
  public host!: string;
  public commentsCount!: number;
  public coordinates!: Coordinates;
}
