import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

import { Button } from "../../components/ui/button";
import { deleteUser, type User } from "../../lib/api/users";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onDeleted: () => void;
}

export function DeleteUserModal({ open, onClose, user, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!user) return;

    try {
      setLoading(true);

      await deleteUser(user.id);

      toast.success("Usuário excluído com sucesso!");

      onDeleted();
      onClose();

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erro ao excluir usuário."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir Usuário</DialogTitle>
        </DialogHeader>

        <p>
          Tem certeza que deseja excluir o usuário{" "}
          <span className="font-semibold">
            {user?.name}
          </span>
          ?
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
