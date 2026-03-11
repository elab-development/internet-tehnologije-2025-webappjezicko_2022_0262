import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { Chart } from "react-google-charts";
import "../styles/NavBar.css";

export default function NavBar({
    brand = "Jezičko",
    links = [],
    isAdmin = false
}) {
    const navigate = useNavigate();

    const [word, setWord] = useState("");
    const [definition, setDefinition] = useState(null);
    const [translation, setTranslation] = useState("");
    const [error, setError] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsError, setAnalyticsError] = useState("");

    const handleLogout = async () => {
        try {
            await api.post("/api/logout/");
        } catch (err) {
            console.error(err);
        }
        navigate("/login");
    };

    const toggleAnalytics = async () => {
        const willOpen = !isAnalyticsOpen;
        setIsAnalyticsOpen(willOpen);

        if (willOpen && chartData.length === 0) {
            setAnalyticsLoading(true);
            try {
                const response = await api.get("/api/user/analytics/enrollments/");
                setChartData(response.data);
            } catch (err) {
                console.error(err);
                setAnalyticsError("Error while loading statistics.");
            } finally {
                setAnalyticsLoading(false);
            }
        }
    };

    const handleSearch = async () => {
        if (!word.trim()) return;
        
        setIsSearching(true);
        setError("");
        setDefinition(null);
        setTranslation("");

        try {
            const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (dictResponse.ok) {
                const dictData = await dictResponse.json();
                setDefinition(dictData[0]);
            } else {
                setError("Word not found in the dictionary.");
            }

            try {
                const translateResponse = await fetch(
                    `https://api.mymemory.translated.net/get?q=${word}&langpair=en|sr`
                );
                const translateData = await translateResponse.json();
                
                if (translateData.responseData && translateData.responseData.translatedText) {
                    setTranslation(translateData.responseData.translatedText);
                }
            } catch (translateErr) {
                console.error("Error while translating: ", translateErr);
                setTranslation("Translate is currently not available.");
            }
        } catch (err) {
            setError("Error while searching.");
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setWord("");
        setDefinition(null);
        setTranslation("");
        setError("");
    };

    return (
        <header className="navbar-wrap">
            <div className="navbar-inner">
                
                <Link to={isAdmin ? "/adminpanel/lessons" : "/home"} className="navbar-brand">
                    {brand}
                </Link>

                <nav className="navbar-links">
                    {links.map((link) => (
                        <Link key={link.to} to={link.to} className="navbar-link">
                            {link.label}
                        </Link>
                    ))}
                </nav>
                
                <div className="navbar-actions">
                    
                    <div className="analytics-wrapper" style={{ position: "relative", marginRight: "15px" }}>
                        <button onClick={toggleAnalytics} className="logout-btn">
                            Progress
                        </button>

                        {isAnalyticsOpen && (
                            <div className="word-tool-results" style={{ width: "380px" }}>
                                <button onClick={() => setIsAnalyticsOpen(false)} className="word-tool-close">✕</button>
                                
                                <h4 className="word-tool-title" style={{ textAlign: "center", marginBottom: "15px", fontSize: "1.3rem" }}>
                                    Current progress
                                </h4>

                                {analyticsLoading ? (
                                    <p className="word-tool-text" style={{ textAlign: "center" }}>Loading data...</p>
                                ) : analyticsError ? (
                                    <p className="word-tool-error" style={{ textAlign: "center" }}>{analyticsError}</p>
                                ) : (
                                    <Chart
                                        chartType="PieChart"
                                        width="100%"
                                        height="250px"
                                        data={chartData}
                                        options={{
                                            backgroundColor: "transparent", 
                                            pieHole: 0.4, 
                                            colors: ["#54cc04", "#2a3b22"], 
                                            legend: { position: "bottom", textStyle: { color: "#ffffff", fontSize: 13 } },
                                            pieSliceBorderColor: "#0e0c14",
                                            tooltip: { textStyle: { color: "#333" }, showColorCode: true }
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="word-tool-wrapper">
                        <input
                            type="text"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            placeholder="Translate word..."
                            className="navbar-input"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} disabled={isSearching} className="logout-btn">
                            {isSearching ? "..." : "Find"}
                        </button>

                        {(definition || translation || error) && (
                            <div className="word-tool-results">
                                <button onClick={clearSearch} className="word-tool-close">✕</button>
                                
                                {error && <p className="word-tool-error">{error}</p>}

                                {translation && (
                                    <div className="word-tool-section">
                                        <h4 className="word-tool-title">Translation:</h4>
                                        <p className="word-tool-text">{translation}</p>
                                    </div>
                                )}

                                {definition && definition.meanings[0]?.definitions[0] && (
                                    <div className="word-tool-section">
                                        <h4 className="word-tool-title">Definition:</h4>
                                        <p className="word-tool-text">
                                            {definition.meanings[0].definitions[0].definition}
                                        </p>

                                        {definition.meanings[0].definitions[0].example && (
                                            <p className="word-tool-example">
                                                Example: "{definition.meanings[0].definitions[0].example}"
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>          
            </div>
        </header>
    );
}