import { useState, useEffect } from "react";
import api from "../api";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/user/me/"); // we’ll create this endpoint next
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div>Loading profile...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {user.name} {user.surname}</p>
      <p><strong>Username:</strong> {user.user_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Birth Date:</strong> {user.birth_date}</p>
      <p><strong>User type:</strong> {user.user_type}</p>
    </div>
  );
}

export default Profile;