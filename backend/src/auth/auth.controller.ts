import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private setJwtCookie(res: Response, token: string) {
    const isSecure = this.configService.get<string>('COOKIE_SECURE') === 'true';
    res.cookie('token', token, {
  httpOnly: true,
  secure: false,      // Biarkan false untuk testing lintas domain
  sameSite: 'lax',    // Ganti dari 'strict'
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: '.vercel.app',  // Agar cookie dikenali di semua subdomain Vercel
});
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.register(dto);
    this.setJwtCookie(res, token);
    return { message: 'Registration successful', user, token };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.login(dto);
    this.setJwtCookie(res, token);
    return { message: 'Login successful', user, token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  async getMe(@GetUser() user: any) {
    return { user };
  }
}
