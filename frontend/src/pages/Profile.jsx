import { useState, useEffect } from "react";
import api from "../api";
import NavBar from "../components/NavBar";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  const handleLogout = async () => {
  try {
    await api.post("/api/logout/");
  } catch (err) {
    console.log(err);
  }
  navigate("/login");
  };

  const actions = (
  <button onClick={handleLogout} className="navbar-btn">
    Logout
  </button>
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("http://localhost:8000/api/user/me/"); // we’ll create this endpoint next
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div>Loading profile...</div>;
  
  let links = [];
  
  if (user.user_type === "admin") {
  links = [
    { to: "/admin", label: "Lessons" },
    { to: "/profile", label: "Profile" },
  ];
  }
  else {
    links = [
    { to: "/", label: "Lessons" },
    { to: "/lessons", label: "Available Lessons" },
    { to: "/profile", label: "Profile" },
  ];
  }


  return (
    <div>
      <NavBar brand="Jezičko" links={links} onSearch={handleSearch} actions={actions} />
  
      <main style={{ padding: "20px" }}>
        {!user ? (
          <div>Loading profile...</div>
        ) : (
          <>
            <h1 className="heading">My Profile</h1>
  
            <div className="profile-container">
              <div className="profile-card">
                <p><strong>Name:</strong> {user.name} {user.surname}</p>
                <p><strong>Username:</strong> {user.user_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Birth Date:</strong> {user.birth_date}</p>
                <p><strong>User type:</strong> {user.user_type}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;