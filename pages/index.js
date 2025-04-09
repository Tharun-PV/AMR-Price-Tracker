import { useState } from "react";
import PriceDisplay from "../components/PriceDisplay";
import DateRangePicker from "../components/DateRangePicker";

export async function getServerSideProps() {
  const currentDateTime = new Date().toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return { props: { initialDateTime: currentDateTime } };
}

export default function Home({ initialDateTime }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priceRange, setPriceRange] = useState([]);

  const handleCheckPriceRange = () => {
    setShowDatePicker(true);
  };

  const handleDateSubmit = async ({ fromDate, toDate }) => {
    const response = await fetch(`/api/price?fromDate=${fromDate}T00:00:00Z&toDate=${toDate}T23:59:59Z`);
    const data = await response.json();
    setPriceRange(data);
    setShowDatePicker(false);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      {!showDatePicker ? (
        <PriceDisplay onCheckPriceRange={handleCheckPriceRange} initialDateTime={initialDateTime} />
      ) : (
        <DateRangePicker onSubmit={handleDateSubmit} />
      )}
      {priceRange.length > 0 && (
        <div
          style={{
            padding: "40px",
            backgroundColor: "#2a2a2a",
            color: "#e0e0e0",
            textAlign: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            maxWidth: "800px",
            margin: "20px auto",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: "28px", color: "#fff" }}>Price Range Data</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
              backgroundColor: "#3a3a3a",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#333" }}>
                <th style={{ padding: "15px", color: "#fff", borderBottom: "2px solid #444" }}>NAME</th>
                <th style={{ padding: "15px", color: "#fff", borderBottom: "2px solid #444" }}>DATE</th>
                <th style={{ padding: "15px", color: "#fff", borderBottom: "2px solid #444" }}>PRICE</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(processPriceRange()).flatMap(([name, entries]) =>
                entries.map((entry, index) => (
                  <tr
                    key={`${name}-${index}`}
                    style={{
                      backgroundColor: "#4a4a4a",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#5a5a5a")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#4a4a4a")}
                  >
                    <td style={{ padding: "15px", borderBottom: "1px solid #444" }}>
                      {index === 0 ? name : ""}
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #444" }}>{entry.date}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #444" }}>
                      {`₹ ${entry.price || "-"} /gm`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  function processPriceRange() {
    const priceMap = {};
    priceRange.forEach(item => {
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
      if (!priceMap[key]) priceMap[key] = [];
      priceMap[key].push({
        date: item.todayDate,
        price: item.rate / item.unit,
      });
    });
    return priceMap;
  }
}