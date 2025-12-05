import { useState } from "react";
import { login } from "../lib/api/auth";
import { useNavigate } from "react-router-dom";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await login(form);

      // salvar token
      localStorage.setItem("token", res.token);

      toast.success("Login realizado!");

      // redirecionar após login
      navigate("/");

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Credenciais inválidas."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Entrar</h1>

        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Senha</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
