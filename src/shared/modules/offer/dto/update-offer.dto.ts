import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Length,
  Max,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayNotEmpty,
  IsString,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { Amenity, City, HousingType } from '../../../types/index.js';
import { CoordinatesDto } from './coordinates.dto.js';

export class UpdateOfferDto {
  @IsOptional()
  @Length(10, 100, { message: 'Name length must be between 10 and 100 characters' })
  public name?: string;

  @IsOptional()
  @Length(20, 1024, { message: 'Description length must be between 20 and 1024 characters' })
  public description?: string;

  @IsOptional()
  @IsEnum(City, { message: 'Invalid city' })
  public city?: City;

  @IsOptional()
  @IsString({ message: 'previewSrc must be a string' })
  @Matches(/\.(jpg|png)$/i, { message: 'previewSrc must be a valid image path (.jpg, .png)' })
  public previewSrc?: string;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @ArrayMinSize(6, { message: 'There must be exactly 6 images' })
  @ArrayMaxSize(6, { message: 'There must be exactly 6 images' })
  @IsString({ each: true, message: 'Each image must be a string' })
  @Matches(/\.(jpg|png)$/i, { each: true, message: 'Each image must be a valid image path (.jpg, .png)' })
  public images?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium?: boolean;

  @IsOptional()
  @IsEnum(HousingType, { message: 'Invalid housing type' })
  public type?: HousingType;

  @IsOptional()
  @IsInt({ message: 'Bedrooms count must be an integer' })
  @Min(1, { message: 'Minimum bedrooms count is 1' })
  @Max(8, { message: 'Maximum bedrooms count is 8' })
  public bedroomsCount?: number;

  @IsOptional()
  @IsInt({ message: 'Guest count must be an integer' })
  @Min(1, { message: 'Minimum guest count is 1' })
  @Max(10, { message: 'Maximum guest count is 10' })
  public guestCount?: number;

  @IsOptional()
  @IsInt({ message: 'Price must be an integer' })
  @Min(100, { message: 'Minimum price is 100' })
  @Max(100000, { message: 'Maximum price is 100000' })
  public price?: number;

  @IsOptional()
  @IsArray({ message: 'Amenities must be an array' })
  @ArrayNotEmpty({ message: 'Amenities must not be empty' })
  @IsEnum(Amenity, { each: true, message: 'Invalid amenity' })
  public amenities?: Amenity[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  public coordinates?: CoordinatesDto;
}
