import { Link, useNavigate } from "react-router-dom";
import api from "../api"; // Make sure this path is correct based on your folder structure!
import "../styles/NavBar.css"

export default function NavBar({
    brand = "Jezičko",
    links = [],
}) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/api/logout/");
        } catch (err) {
            console.error(err);
        }
        navigate("/login");
    };

    return (
        <header className="navbar-wrap">
            <div className="navbar-inner">

                <Link to="/" className="navbar-brand">{brand}</Link>

                <nav className="navbar-links">
                    {links.map((link) => (
                        <Link key={link.to} to={link.to} className="navbar-link">
                            {link.label}
                        </Link>
                    ))}
                </nav>
                
                <div className="navbar-actions">
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>          
            </div>
        </header>
    );
}