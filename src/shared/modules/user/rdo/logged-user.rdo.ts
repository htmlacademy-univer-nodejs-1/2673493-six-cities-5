import { Expose } from 'class-transformer';

export class LoggedUserRdo {
  @Expose()
  public token!: string;
}
