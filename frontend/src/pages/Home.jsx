import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

function Home() {
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/lessons", label: "Lessons" },
    { to: "/profile", label: "Profile" },
  ];

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/login");
  };

  const token = localStorage.getItem(ACCESS_TOKEN);
  const actions = token ? (
    <button onClick={handleLogout}>Logout</button>
  ) : (
    <>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/register")}>Register</button>
    </>
  );

  return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />

      <main>
        <h1>Welcome to Jezičko!</h1>
      </main>
    </div>
  );
}

export default Home;