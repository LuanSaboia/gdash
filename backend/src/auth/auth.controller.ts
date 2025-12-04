// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Isso define o prefixo /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') // Isso define a rota POST /auth/login
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}