import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Swal from "sweetalert2";

const AddDengueData = () => {
  const [loc, setLoc] = useState("");
  const [cases, setCases] = useState("");
  const [deaths, setDeaths] = useState("");
  const [date, setDate] = useState("");
  const [Region, setRegion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dengueCollection = collection(db, "dengueData");
      await addDoc(dengueCollection, {
        loc: loc,
        cases: Number(cases),
        deaths: Number(deaths),
        date: date,
        Region: Region,
      });

      Swal.fire({
        title: "Success!",
        text: "Dengue data added successfully!, you can add another data",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Clear form fields
      setLoc("");
      setCases("");
      setDeaths("");
      setDate("");
      setRegion("");
    } catch (err) {
      console.error("Error adding data: ", err);

      Swal.fire({
        title: "Error!",
        text: "Failed to add dengue data. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Location"
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Cases"
        value={cases}
        onChange={(e) => setCases(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Deaths"
        value={deaths}
        onChange={(e) => setDeaths(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Region"
        value={Region}
        onChange={(e) => setRegion(e.target.value)}
        required
      />
      <button type="submit">Add Dengue Data</button>
    </form>
  );
};

export default AddDengueData;
