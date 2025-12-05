// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Isso define o prefixo /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);
    
    // --- A PROTEÇÃO ESTÁ AQUI ---
    if (!result) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }
    // -----------------------------
    
    return result;
  }
}