import { Expose, Transform } from 'class-transformer';
import { UserType } from '../../../types/index.js';

export class UserRdo {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  public avatarSrc!: string;

  @Expose()
  public type!: UserType;
}
