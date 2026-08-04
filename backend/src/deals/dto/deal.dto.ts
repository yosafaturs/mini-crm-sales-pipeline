import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString, Min } from 'class-validator';
import { DealStage } from '@prisma/client';

export class CreateDealDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}

export class UpdateDealStageDto {
  @IsNotEmpty()
  @IsEnum(DealStage)
  stage: DealStage;
}

export class AssignDealDto {
  @IsNotEmpty()
  @IsString()
  assignedUserId: string;
}
