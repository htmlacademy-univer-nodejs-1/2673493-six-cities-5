import { Expose, Transform } from 'class-transformer';
import { City, HousingType } from '../../../types/index.js';

export class OfferShortRdo {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  public id!: string;

  @Expose()
  public price!: number;

  @Expose()
  public name!: string;

  @Expose()
  public type!: HousingType;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public city!: City;

  @Expose()
  public previewSrc!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public commentsCount!: number;
}
