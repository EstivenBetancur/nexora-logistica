import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NexoraProvider, useNexora } from "./context/NexoraContext";
import { ROLES_PERMISOS } from "./services/NexoraDatabase";

// Componentes globales de navegación y estructura
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";

// Páginas aisladas (sin menú ni footer propios)
import LoginPage from "./pages/LoginPage";
import TableroPage from "./pages/TableroPage";
import PersonalPage from "./pages/PersonalPage";
import InsumosPage from "./pages/InsumosPage";
import MisionesPage from "./pages/MisionesPage";
import MisionDetallePage from "./pages/MisionDetallePage";
import FlotaPage from "./pages/FlotaPage";
import ReportesPage from "./pages/ReportesPage";
import AuditoriaPage from "./pages/AuditoriaPage";
import UsuariosPage from "./pages/UsuariosPage";
import ForbiddenPage from "./pages/ForbiddenPage";

function ProtectedLayout({ children }) {
  const { currentUser, tieneAccesoRuta } = useNexora();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const permitido = tieneAccesoRuta(location.pathname);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="page-content">
          {permitido ? children : <ForbiddenPage />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function DefaultRedirect() {
  const { currentUser } = useNexora();
  if (!currentUser) return <Navigate to="/login" replace />;
  const inicio = ROLES_PERMISOS[currentUser.rol]?.inicio || "/tablero";
  return <Navigate to={inicio} replace />;
}

export default function App() {
  return (
    <NexoraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/tablero"
            element={
              <ProtectedLayout>
                <TableroPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/personal"
            element={
              <ProtectedLayout>
                <PersonalPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/insumos"
            element={
              <ProtectedLayout>
                <InsumosPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/misiones"
            element={
              <ProtectedLayout>
                <MisionesPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/misiones/:codigo"
            element={
              <ProtectedLayout>
                <MisionDetallePage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/flota"
            element={
              <ProtectedLayout>
                <FlotaPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedLayout>
                <ReportesPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/auditoria"
            element={
              <ProtectedLayout>
                <AuditoriaPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedLayout>
                <UsuariosPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </NexoraProvider>
  );
}