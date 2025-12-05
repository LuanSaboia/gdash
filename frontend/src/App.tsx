import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InsightsPage from "./pages/InsightsPage";
import { ProtectedLayout } from "./components/ProtectedLayout";
import LoginPage from "./pages/LoginPage";
import { UsersPage } from "./pages/UserPage";
import ExplorePage from "./pages/ExplorePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <ProtectedLayout><HomePage /> </ProtectedLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/insights" element={ <ProtectedLayout><InsightsPage /> </ProtectedLayout>} />
        <Route path="/users" element={ <ProtectedLayout><UsersPage /> </ProtectedLayout>} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>

    </BrowserRouter>
    
  );
}

export default App;
