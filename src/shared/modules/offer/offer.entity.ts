import { defaultClasses, getModelForClass, prop, modelOptions, Ref } from '@typegoose/typegoose';
import { Amenity, City, HousingType } from '../../types/index.js';
import { UserEntity } from '../user/user.entity.js';
import { CoordinatesEntity } from '../coordinates/coordinates.entity.js';

export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers'
  }
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 10, maxlength: 100 })
  public name!: string;

  @prop({ required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true })
  public publicationDate!: Date;

  @prop({ required: true, type: () => String, enum: ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'] })
  public city!: City;

  @prop({ required: true })
  public previewSrc!: string;

  @prop({ required: true, type: () => [String], arrayMinLength: 6, arrayMaxLength: 6, })
  public images!: string[];

  @prop({ required: true })
  public isPremium!: boolean;

  @prop({ required: true, default: false })
  public isFavorite!: boolean;

  @prop({ required: true, min: 1, max: 5 })
  public rating!: number;

  @prop({ required: true, type: () => String, enum: ['apartment', 'house', 'room', 'hotel'] })
  public type!: HousingType;

  @prop({ required: true, min: 1, max: 8 })
  public bedroomsCount!: number;

  @prop({ required: true, min: 1, max: 10 })
  public guestCount!: number;

  @prop({ required: true, min: 100, max: 100000 })
  public price!: number;

  @prop({
    required: true,
    type: () => [String],
    enum: ['Breakfast', 'Air conditioning', 'Laptop friendly workspace', 'Baby seat', 'Washer', 'Towels', 'Fridge'],
  })
  public amenities!: Amenity[];

  @prop({ required: true, ref: () => UserEntity })
  public host!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount!: number;

  @prop({ required: true, _id: false })
  public coordinates!: CoordinatesEntity;
}

export const OfferModel = getModelForClass(OfferEntity);
