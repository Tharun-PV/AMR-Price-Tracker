import { useState } from "react";

const DateRangePicker = ({ onSubmit }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSubmit = () => {
    if (fromDate && toDate) {
      onSubmit({ fromDate, toDate });
    } else {
      alert("Please select both dates");
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#1a1a1a", color: "#fff" }}>
      <h2>Select Date Range</h2>
      <div>
        <label>From: </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value + "T00:00:00Z")}
          style={{ margin: "10px" }}
        />
      </div>
      <div>
        <label>To: </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value + "T23:59:59Z")}
          style={{ margin: "10px" }}
        />
      </div>
      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default DateRangePicker;