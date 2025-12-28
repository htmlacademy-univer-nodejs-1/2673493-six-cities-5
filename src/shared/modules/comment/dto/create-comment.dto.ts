import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Text is required' })
  @Length(5, 1024, { message: 'Text length must be between 5 and 1024 characters' })
  public text!: string;

  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Minimum rating is 1' })
  @Max(5, { message: 'Maximum rating is 5' })
  public rating!: number;

  public offerId!: string;
}
