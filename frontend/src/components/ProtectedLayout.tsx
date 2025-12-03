import { Navigate } from "react-router-dom";
import { Navbar } from "./Navbar";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">{children}</div>
    </div>
  );
}
