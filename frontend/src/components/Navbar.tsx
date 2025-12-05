import { Link, useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="w-full bg-white border-b shadow-sm p-4 flex justify-between items-center">
      <div className="flex gap-6">
        <Link className="text-sm font-medium hover:text-blue-600" to="/">
          Dashboard
        </Link>

        <Link className="text-sm font-medium hover:text-blue-600" to="/explore">
          Explorar
        </Link>

        <Link className="text-sm font-medium hover:text-blue-600" to="/insights">
          Insights da IA
        </Link>
      </div>

      <div className="flex gap-6">
        <Link className="text-sm font-medium hover:text-blue-600" to="/users">
            Usuários
        </Link>

        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
