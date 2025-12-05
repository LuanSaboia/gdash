export class CreateUserDto {
  name: string;
  email: string;
  password?: string; // Opcional, no editar pode vir sem valor
  role?: string;
}