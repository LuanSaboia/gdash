import { api } from "../api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export async function getUsers() {
  const response = await api.get<User[]>("/users");
  return response.data;
}

export async function getUserById(id: string) {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserDTO) {
  const response = await api.post<User>("/users", data);
  return response.data;
}

export async function updateUser(id: string, data: UpdateUserDTO) {
  const response = await api.patch<User>(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}
