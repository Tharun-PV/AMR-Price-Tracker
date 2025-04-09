"use client";

import { useState, useEffect } from "react";

const PriceDisplay = ({ onCheckPriceRange }) => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const fetchPrices = async () => {
    setLoading(true);
    const response = await fetch("/api/price");
    const data = await response.json();
    const priceMap = data.reduce((acc, item) => {
      let key;
      switch (item.metaProdTypeName) {
        case "Gold":
          key = `GOLD (${item.purity.split("K")[0]}K)`;
          break;
        case "ROSEGOLD":
          key = "ROSEGOLD";
          break;
        case "Diamond":
          key = "DIAMOND";
          break;
        case "Silver":
          key = "SILVER";
          break;
        default:
          key = item.metaProdTypeName;
      }
      acc[key] = item.rate / item.unit || "-";
      return acc;
    }, {});
    setPrices(priceMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ position: "absolute", top: "20px", left: "20px", fontSize: "28px" }}>
        <span role="img" aria-label="diamond">💎</span>
      </div>
      <h1 style={{ margin: "0 0 20px", fontSize: "32px", color: "#fff" }}>AMR Price Tracker</h1>
      <p style={{ margin: "0 0 30px", fontSize: "16px", color: "#b0b0b0" }}>
        Date & Time: {formatDateTime(currentDateTime)}
      </p>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 10px",
          backgroundColor: "#2a2a2a",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#333" }}>
            <th style={{ padding: "15px", color: "#fff", borderBottom: "2px solid #444" }}>NAME</th>
            <th style={{ padding: "15px", color: "#fff", borderBottom: "2px solid #444" }}>PRICE</th>
          </tr>
        </thead>
        <tbody>
          {["DIAMOND", "GOLD (18K)", "GOLD (22K)", "ROSEGOLD", "SILVER"].map((item) => (
            <tr
              key={item}
              style={{
                backgroundColor: "#3a3a3a",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#4a4a4a")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#3a3a3a")}
            >
              <td style={{ padding: "15px", borderBottom: "1px solid #444" }}>{item}</td>
              <td style={{ padding: "15px", borderBottom: "1px solid #444" }}>
                {loading ? "Loading..." : `₹ ${prices[item]} /gm`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          onClick={fetchPrices}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
        >
          Check Current Price
        </button>
        <button
          onClick={onCheckPriceRange}
          style={{
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
        >
          <span role="img" aria-label="calendar">📅</span> Check Price Range
        </button>
      </div>
    </div>
  );
};

export default PriceDisplay;