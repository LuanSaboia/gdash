import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InsightsPage from "./pages/InsightsPage";
import History from "./pages/History";
import { ProtectedLayout } from "./components/ProtectedLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <ProtectedLayout><HomePage /> </ProtectedLayout>} />
        <Route path="/insights" element={ <ProtectedLayout><InsightsPage /> </ProtectedLayout>} />
        <Route path="/history" element={ <ProtectedLayout><History /> </ProtectedLayout>} />
      </Routes>
      <a href="/history" className="text-blue-600 underline">
        Ver histórico completo →
      </a>

    </BrowserRouter>
    
  );
}

export default App;
