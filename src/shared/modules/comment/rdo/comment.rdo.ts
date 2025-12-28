import { Expose, Transform, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class CommentRdo {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public rating!: number;

  @Expose({ name: 'user' })
  @Type(() => UserRdo)
  public user!: UserRdo;
}
