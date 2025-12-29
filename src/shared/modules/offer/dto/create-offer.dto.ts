import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  Length,
  Max,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  Matches
} from 'class-validator';
import { Amenity, City, HousingType } from '../../../types/index.js';
import { CoordinatesDto } from './coordinates.dto.js';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @Length(10, 100, { message: 'Name length must be between 10 and 100 characters' })
  public name!: string;

  @Length(20, 1024, { message: 'Description length must be between 20 and 1024 characters' })
  public description!: string;

  @IsEnum(City, { message: 'Invalid city' })
  public city!: City;

  @IsString({ message: 'previewSrc must be a string' })
  @Matches(/\.(jpg|png)$/i, { message: 'previewSrc must be a valid image path (.jpg, .png)' })
  public previewSrc!: string;

  @IsArray({ message: 'Images must be an array' })
  @ArrayMinSize(6, { message: 'There must be exactly 6 images' })
  @ArrayMaxSize(6, { message: 'There must be exactly 6 images' })
  @IsString({ each: true, message: 'Each image must be a string' })
  @Matches(/\.(jpg|png)$/i, { each: true, message: 'Each image must be a valid image path (.jpg, .png)' })
  public images!: string[];

  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium!: boolean;

  @IsEnum(HousingType, { message: 'Invalid housing type' })
  public type!: HousingType;

  @IsInt({ message: 'Bedrooms count must be an integer' })
  @Min(1, { message: 'Minimum bedrooms count is 1' })
  @Max(8, { message: 'Maximum bedrooms count is 8' })
  public bedroomsCount!: number;

  @IsInt({ message: 'Guest count must be an integer' })
  @Min(1, { message: 'Minimum guest count is 1' })
  @Max(10, { message: 'Maximum guest count is 10' })
  public guestCount!: number;

  @IsInt({ message: 'Price must be an integer' })
  @Min(100, { message: 'Minimum price is 100' })
  @Max(100000, { message: 'Maximum price is 100000' })
  public price!: number;

  @IsArray({ message: 'Amenities must be an array' })
  @ArrayNotEmpty({ message: 'Amenities must not be empty' })
  @IsEnum(Amenity, { each: true, message: 'Invalid amenity' })
  public amenities!: Amenity[];

  @ValidateNested()
  @Type(() => CoordinatesDto)
  public coordinates!: CoordinatesDto;

  @IsOptional()
  @IsDateString({}, { message: 'publicationDate must be a valid ISO date' })
  public publicationDate?: Date;

  @IsOptional()
  @IsNumber({}, { message: 'rating must be a number' })
  @Min(1)
  @Max(5)
  public rating?: number;

  @IsOptional()
  @IsInt({ message: 'commentsCount must be an integer' })
  public commentsCount?: number;
}
