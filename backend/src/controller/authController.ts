import { Request, Response } from "express";
import prisma from "prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    // 1. validar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    // 2. validar senha
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    // 3. gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    return res.json({ token });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ message: "Erro interno ao fazer login." });
  }
}
