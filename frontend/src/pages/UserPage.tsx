// frontend/src/pages/UsersPage.tsx

import { useEffect, useState } from "react";
import { getUsers, type User } from "../lib/api/users";
import { Button } from "../components/ui/button"
import { CreateUserModal } from "../components/users/CreateUserModal";

import { Loader2 } from "lucide-react";
import { EditUserModal } from "../components/users/EditUserModal";
import { DeleteUserModal } from "../components/users/DeleteUserModal";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDelete, setOpenDelete] = useState(false);


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
        <Button onClick={() => setOpenCreate(true)}>
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
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {/* <Button onClick={() => setOpenCreate(true)}>
                      Novo Usuário
                    </Button> */}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenEdit(true);
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setOpenDelete(true);
                    }}
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
      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadUsers}
      />
      <EditUserModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        user={selectedUser}
        onUpdated={loadUsers}
      />
      <DeleteUserModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        user={selectedUser}
        onDeleted={loadUsers}
      />


    </div>
  );
}
