import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";
import { Link } from "react-router-dom";

function RegisterForm() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [userType, setUserType] = useState("regular");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/api/user/register/", {
        name,
        surname,
        email,
        user_name: userName,
        birth_date: birthDate,
        user_type: userType,
        password,
      });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data) {
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Register</h1>

      <input
        className="form-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First Name"
        required
      />

      <input
        className="form-input"
        type="text"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        placeholder="Surname"
        required
      />

      <input
        className="form-input"
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Username"
        required
      />

      <input
        className="form-input"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        placeholder="Birth Date"
        required
      />

      <select
        className="form-input"
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
      >
        <option value="regular">Regular</option>
        <option value="premium">Premium</option>
      </select>

      <input
        className="form-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <p>
        Back to login? {" "}
        <Link to="/login" className="register-link">
          Take me there
        </Link>
      </p>

      <button className="form-button-register" type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}

export default RegisterForm;