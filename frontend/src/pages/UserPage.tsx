// frontend/src/pages/UsersPage.tsx

import { useEffect, useState } from "react";
import { getUsers, type User } from "../lib/api/users";
import { Button } from "../components/ui/button"

import { Loader2 } from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 carrega usuários ao entrar na página
  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>

        {/* Botão para abrir modal de criação */}
        <Button onClick={() => {}}>
          Novo Usuário
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      {/* Tabela */}
      {!loading && !error && (
        <div className="overflow-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2">Função</th>
                <th className="px-4 py-2 w-32">Ações</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {}}
                    >
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {}}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
