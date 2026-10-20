import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import CalendarPage from "./pages/Calendar.jsx";
import Study from "./pages/Study.jsx";

function Guard({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/" replace />;
}

// HashRouter keeps deep links working on GitHub Pages (static hosting, no rewrites).
export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/home" element={<Guard><Home /></Guard>} />
          <Route path="/calendar" element={<Guard><CalendarPage /></Guard>} />
          <Route path="/study" element={<Guard><Study /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
