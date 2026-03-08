import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import api from "../api"; 

export default function EnrollmentChart() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get("/api/user/analytics/enrollments/");
                setChartData(response.data);
            } catch (err) {
                console.error("Greška pri povlačenju statistike:", err);
                setError("Neuspelo učitavanje grafikona.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <p style={{ color: "#54cc04" }}>Učitavanje analitike...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ 
            backgroundColor: "#0e0c14", 
            padding: "20px", 
            borderRadius: "10px", 
            border: "2px solid #54cc04",
            maxWidth: "600px",
            margin: "0 auto" 
        }}>
            <h2 style={{ color: "#54cc04", fontStyle: "oblique", textAlign: "center", marginBottom: "20px" }}>
                Tvoj napredak na platformi
            </h2>
            
            <Chart
                chartType="PieChart"
                width="100%"
                height="300px"
                data={chartData}
                options={{
                    backgroundColor: "#0e0c14",
                    pieHole: 0.4, 
                    colors: ["#54cc04", "#2a3b22"], 
                    legend: {
                        position: "bottom",
                        textStyle: { color: "#ffffff", fontSize: 14 } 
                    },
                    pieSliceBorderColor: "#0e0c14", 
                    tooltip: {
                        textStyle: { color: "#333" }, 
                        showColorCode: true
                    }
                }}
            />
        </div>
    );
}