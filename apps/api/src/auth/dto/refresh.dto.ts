import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  @MinLength(1, { message: 'A refresh token is required' })
  refreshToken!: string;
}
