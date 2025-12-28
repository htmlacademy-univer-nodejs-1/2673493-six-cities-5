import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { UserType } from '../../../types/index.js';

export class CreateUserDto {
  @IsString({ message: 'Name is required' })
  @Length(1, 15, { message: 'Name length must be between 1 and 15 characters' })
  public name!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  public email!: string;

  @IsString({ message: 'Password is required' })
  @Length(6, 12, { message: 'Password length must be between 6 and 12 characters' })
  public password!: string;

  @IsEnum(
    { Pro: 'pro', Obichnii: 'обычный' },
    { message: 'Invalid user type. Must be "pro" or "обычный"' }
  )
  public type!: UserType;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  public avatarSrc?: string;
}
