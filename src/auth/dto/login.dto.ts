import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'nico@test.com',
    description: 'User email',
  })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '*****',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
