"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ onSubmit }) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromDate && toDate && fromDate <= toDate) {
      onSubmit({ fromDate: fromDate.toISOString().split("T")[0], toDate: toDate.toISOString().split("T")[0] });
    } else {
      alert("Please select a valid date range (From Date should be before To Date).");
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#2a2a2a",
        color: "#e0e0e0",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: "600px",
        margin: "20px auto",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2 style={{ margin: "0 0 20px", fontSize: "28px", color: "#fff" }}>Select Date Range</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
          <label style={{ fontSize: "18px", color: "#b0b0b0" }}>From Date:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            placeholderText="Select start date"
            className="custom-datepicker"
            style={{ padding: "10px", borderRadius: "5px" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
          <label style={{ fontSize: "18px", color: "#b0b0b0" }}>To Date:</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            minDate={fromDate}
            placeholderText="Select end date"
            className="custom-datepicker"
            style={{ padding: "10px", borderRadius: "5px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "background-color 0.3s",
            width: "100%",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => onSubmit({ fromDate: null, toDate: null })}
          style={{
            padding: "12px 24px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "background-color 0.3s",
            width: "100%",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
        >
          Cancel
        </button>
      </form>

      {/* Custom CSS to enhance datepicker appearance */}
      <style jsx>{`
        .custom-datepicker {
          padding: 10px 15px;
          font-size: 16px;
          border: 1px solid #444;
          border-radius: 5px;
          background-color: #3a3a3a;
          color: #e0e0e0;
          width: 200px;
          outline: none;
          transition: border-color 0.3s;
        }
        .custom-datepicker:focus {
          border-color: #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
        }
        .react-datepicker {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background-color: #2a2a2a;
          border: 1px solid #444;
          border-radius: 5px;
          color: #e0e0e0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .react-datepicker__header {
          background-color: #333;
          border-bottom: 1px solid #444;
          color: #fff;
        }
        .react-datepicker__day-name,
        .react-datepicker__day {
          color: #e0e0e0;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #007bff;
          color: #fff;
        }
        .react-datepicker__day--disabled {
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;