import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class CoordinatesDto {
  @IsNumber({}, { message: 'Latitude must be a number' })
  @IsLatitude({ message: 'Invalid latitude value' })
  public latitude!: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @IsLongitude({ message: 'Invalid longitude value' })
  public longitude!: number;
}
