import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SuggestPostDto {
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  q: string;
}
