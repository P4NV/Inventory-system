import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const BCRYPT_ROUNDS = 10;
const GUEST_TTL = '24h';

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export interface SanitizedUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const name = dto.name?.trim() || null;
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = this.generateToken(user.id, user.email, user.role, '7d');
    return { user, token };
  }

  async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email, user.role, '7d');
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async loginAsGuest() {
    const random = randomBytes(8).toString('hex');
    const email = `guest+${random}@guest.local`;
    const randomPassword = randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Guest',
        role: 'guest',
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = this.generateToken(user.id, user.email, user.role, GUEST_TTL);
    return { user, token };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(userId: string, email: string, role: string, expiresIn: SignOptions['expiresIn']) {
    return this.jwtService.sign({ sub: userId, email, role }, { expiresIn });
  }
}
