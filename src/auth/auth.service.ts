import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

export interface VanguardiaProfileResponse {
  [key: string]: unknown;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      name,
      email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(newUser);

    const payload = { sub: savedUser.id, email: savedUser.email, name: savedUser.name };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // ====================================================================
  // NUEVA INTEGRACIÓN: Proxy para API Externa (Vanguardia)
  // ====================================================================
  async getVanguardiaProfile(email: string) {
    if (!email) {
      throw new BadGatewayException('El parámetro de correo es obligatorio');
    }

    // 1. Construir el objeto JSON y codificarlo para la URL
    const queryObj = { mail: email };
    const encodedQuery = encodeURIComponent(JSON.stringify(queryObj));

    // 2. Ensamblar la URL objetivo con todos los params fijos
    const targetUrl = `https://www.vanguardia.com/pf/api/v3/content/fetch/vg-user-data?query=${encodedQuery}&d=421&mxId=00000000&_website=vanguardia`;

    try {
      // 3. Hacer la petición servidor a servidor (Sin problemas de CORS)
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Integration-Proxy/1.0',
        },
      });

      if (!response.ok) {
        // Lanzamos el error para que el bloque catch lo atrape y lo formatee
        throw new Error(`External API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as VanguardiaProfileResponse;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Aquí idealmente usarías un Logger de NestJS: this.logger.error(...)
      console.error('Proxy Error [Vanguardia]:', errorMessage);

      // Retornamos un 502 Bad Gateway al frontend
      throw new BadGatewayException('No se pudo obtener el perfil del proveedor externo');
    }
  }
}
