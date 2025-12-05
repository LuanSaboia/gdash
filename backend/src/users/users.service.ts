import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Criar usuário (com hash de senha)
  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password!, 10);
    
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role || 'user',
      },
    });
  }

  // Listar todos (removendo a senha do retorno por segurança)
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Buscar um
  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Atualizar
  async update(id: string, data: UpdateUserDto) {
    const updateData: any = { ...data };

    // Se mandou senha nova, hasheia ela
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password; // Remove o campo 'password' cru
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // Deletar
  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}