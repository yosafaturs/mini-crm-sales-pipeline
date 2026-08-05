import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateInteractionDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
