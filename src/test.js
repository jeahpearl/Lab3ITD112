import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";  
import { db } from "../../firebase";  

const AddDengueData = () => {
  const [respondents, setRespondents] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [ethnic, setEthnic] = useState("");
  const [academicPerformance, setAcademicPerformance] = useState("");
  const [academicDescription, setAcademicDescription] = useState("");
  const [iq, setIQ] = useState("");  // IQ is treated as a description (text)
  const [typeOfSchool, setTypeOfSchool] = useState("");
  const [socioEconomicStatus, setSocioEconomicStatus] = useState("");
  const [studyHabit, setStudyHabit] = useState("");
  const [natResults, setNatResults] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const natCollection = collection(db, "natData");
      await addDoc(natCollection, {
        respondents: respondents,
        age: Number(age),
        sex: sex,
        ethnic: ethnic,
        academic_performance: academicPerformance,
        academic_description: academicDescription,
        iq: iq,  // IQ is a description (text)
        type_of_school: typeOfSchool,
        socio_economic_status: socioEconomicStatus,
        study_habit: studyHabit,
        nat_results: Number(natResults)
      });
      alert("Data added successfully!");
      // Clear the form
      setRespondents("");
      setAge("");
      setSex("");
      setEthnic("");
      setAcademicPerformance("");
      setAcademicDescription("");
      setIQ("");
      setTypeOfSchool("");
      setSocioEconomicStatus("");
      setStudyHabit("");
      setNatResults("");
    } catch (err) {
      console.error("Error adding data: ", err);
      alert("Error adding data. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Respondents"
        value={respondents}
        onChange={(e) => setRespondents(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Sex"
        value={sex}
        onChange={(e) => setSex(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Ethnicity"
        value={ethnic}
        onChange={(e) => setEthnic(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Academic Performance"
        value={academicPerformance}
        onChange={(e) => setAcademicPerformance(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Academic Description"
        value={academicDescription}
        onChange={(e) => setAcademicDescription(e.target.value)}
        required
      />
      <input
        type="text"  // Treat IQ as a text input field
        placeholder="IQ (Description)"
        value={iq}
        onChange={(e) => setIQ(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Type of School"
        value={typeOfSchool}
        onChange={(e) => setTypeOfSchool(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Socio-Economic Status"
        value={socioEconomicStatus}
        onChange={(e) => setSocioEconomicStatus(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Study Habit"
        value={studyHabit}
        onChange={(e) => setStudyHabit(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="NAT Results"
        value={natResults}
        onChange={(e) => setNatResults(e.target.value)}
        required
      />
      <button type="submit">Add Data</button>
    </form>
  );
};

export default AddDengueData;
