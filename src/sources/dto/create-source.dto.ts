import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateSourceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly name: string;
}
