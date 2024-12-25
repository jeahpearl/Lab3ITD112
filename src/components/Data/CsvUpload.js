import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";  
import { db } from "../../firebase";  

const CsvUpload = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("Please upload a valid CSV file.");
      return;
    }
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
        setError(null);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const saveToDatabase = async () => {
    if (csvData.length === 0) {
      setError("No data to save. Please upload a CSV file.");
      return;
    }

    setLoading(true);
    try {
      const dengueCollection = collection(db, "dengueData");
      for (const row of csvData) {
        const { loc, cases, deaths, date, Region } = row;

        await addDoc(dengueCollection, {
          loc: loc,
          cases: Number(cases),  // Converting string to number
          deaths: Number(deaths),  // Converting string to number
          date: date,  // Storing date as a string
          Region: Region,
        });
      }
      alert("Data saved successfully!");
    } catch (err) {
      console.error("Error saving data: ", err);
      setError(`Error saving data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current.click()} className="custom-file-upload">
        Choose File
      </button>

      {csvData.length > 0 && (
        <>
          <br />
          <button onClick={saveToDatabase} disabled={loading} className="save-button">
            {loading ? "Saving Data..." : "Save to Database"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CsvUpload;
