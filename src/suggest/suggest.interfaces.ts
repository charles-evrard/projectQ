import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestPostDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  q: string;
}
