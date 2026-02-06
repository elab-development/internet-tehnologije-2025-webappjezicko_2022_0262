import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css"

export default function NavBar({
    brand = "Jezičko",
    links = [],
    onSearch,
    searchPlaceholder = "Search...",
    actions = null,
}) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(query);
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

                {onSearch && (
                    <form onSubmit={handleSubmit} className="navbar-search">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="navbar-input"
                        />
                        <button type="submit" className="navbar-btn">Search</button>
                    </form>
                )}
                <div className="navbar-actions">{actions}</div>
            </div>
        </header>
    );
}
