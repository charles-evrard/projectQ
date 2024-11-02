import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsNotBlacklisted } from '../common/isNotBlacklisted.decorator';

export class SuggestGetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNotBlacklisted()
  q: string;
}
