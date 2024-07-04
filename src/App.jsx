import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Login from './pages/Login';

import "./index.css";

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <NextUIProvider>
        <Router>
          {user && <NavBar />}
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default App;
