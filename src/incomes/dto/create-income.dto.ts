import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncomeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  date?: Date;


  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  source: Types.ObjectId;
}
