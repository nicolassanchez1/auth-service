import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiResponse({ status: 201, description: 'User was created.', type: User })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiResponse({ status: 201, description: 'Login succesfully.', type: LoginDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ====================================================================
  // NUEVO ENDPOINT: Consumo del Proxy
  // ====================================================================
  @Get('external-profile')
  @ApiResponse({ status: 200, description: 'External profile fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Missing email parameter.' })
  @ApiResponse({ status: 502, description: 'Bad Gateway. External API failed.' })
  getExternalProfile(@Query('email') email: string) {
    // 💡 NOTA DE ARQUITECTURA PARA PRODUCCIÓN:
    // Actualmente recibe el email por Query (?email=test@...).
    // Por seguridad, te recomendaría luego proteger esta ruta con un @UseGuards(JwtAuthGuard)
    // y extraer el email directamente del token del usuario (@Request() req => req.user.email)
    // para evitar que alguien use tu API para consultar correos de terceros.

    return this.authService.getVanguardiaProfile(email);
  }
}
