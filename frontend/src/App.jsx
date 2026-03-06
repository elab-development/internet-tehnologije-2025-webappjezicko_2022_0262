import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Profile from "./pages/Profile"
import Lessons from "./pages/Lessons"
import Admin from "./pages/Admin"
import Details from "./pages/LessonDetails"
import ProbaTTS from "./pages/ProbaTTS"
import api from "./api";
import Start from "./pages/LessonStart"

function Logout() {
  api.post("/api/logout/");
  return <Navigate to="/login" />
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login" element={<Login />}
        />
        <Route
          path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>}
        />
        <Route
          path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>}
        />
        <Route path="/lessons/:id" element={<Details />} />
        <Route
          path="/logout" element={<Logout />}
        />
        <Route
          path="/proba" element={<ProbaTTS />}
        />
        <Route
          path="/register" element={<Register />}
        />
        <Route
          path="*" element={<NotFound />}
        />

        <Route path="/lessons/:id/start" element={<Start />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <ProtectedRoute>
              <Lessons />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
