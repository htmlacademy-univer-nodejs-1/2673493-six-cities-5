import { Expose, Transform, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';
import { CoordinatesRdo } from './coordinates.rdo.js';
import { Amenity, City, HousingType } from '../../../types/index.js';

export class OfferRdo {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public description!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public city!: City;

  @Expose()
  public previewSrc!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: HousingType;

  @Expose()
  public bedroomsCount!: number;

  @Expose()
  public guestCount!: number;

  @Expose()
  public price!: number;

  @Expose()
  public amenities!: Amenity[];

  @Expose({ name: 'host' })
  @Type(() => UserRdo)
  public host!: UserRdo;

  @Expose()
  public commentsCount!: number;

  @Expose()
  @Type(() => CoordinatesRdo)
  public coordinates!: CoordinatesRdo;
}
