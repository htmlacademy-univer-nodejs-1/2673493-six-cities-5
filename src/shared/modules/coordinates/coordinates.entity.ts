import { prop } from '@typegoose/typegoose';

export class CoordinatesEntity {
  @prop({ required: true })
  public latitude!: number;

  @prop({ required: true })
  public longitude!: number;
}
