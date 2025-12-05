export class CreateUserDto {
  name: string;
  email: string;
  password?: string; // Opcional pois na edição pode não vir
  role?: string;
}