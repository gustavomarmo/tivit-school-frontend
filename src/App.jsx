import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { useContext } from 'react';

function PrivateRoute({ children }) {
  const { userRole } = useContext(AuthContext);
  return userRole ? children : <Navigate to="/login" />;
}

function Alunos() { return <h1>Página de Alunos (Em construção)</h1>; }

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="alunos" element={<Alunos />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;