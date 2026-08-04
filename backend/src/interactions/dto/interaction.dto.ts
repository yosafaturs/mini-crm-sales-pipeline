import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { InteractionType } from '@prisma/client';

export class CreateInteractionDto {
  @IsNotEmpty()
  @IsEnum(InteractionType)
  type: InteractionType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
