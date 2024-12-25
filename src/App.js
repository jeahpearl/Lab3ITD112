import React, { useState } from "react";
import AddDengueData from "./components/Data/AddDengueData";
import DengueDataList from "./components/Data/DengueDataList";
import CsvUpload from "./components/Data/CsvUpload";
import Dashboard from "./components/Dashboard/Dashboard";  // Import the Dashboard component
import Insights from "./components/Insights/Insights";
import './App.css';
import { BiShekel } from "react-icons/bi";
import { BiHomeAlt, BiData, BiLineChart } from "react-icons/bi";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const openAddDataModal = () => {
    setShowAddDataModal(true);
  };

  const closeAddDataModal = () => {
    setShowAddDataModal(false);
  };

  const openCsvModal = () => {
    setShowCsvModal(true);
  };

  const closeCsvModal = () => {
    setShowCsvModal(false);
  };

  const renderPageHeader = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "dataManagement":
        return "Data Management";
      case "insights":
        return "Insights";
      default:
        return "";
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <BiShekel className="sidebar-logo" size="80" />
        <div className="sidebar-tabs">
          <div
            className={`sidebar-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => handleTabChange("dashboard")}
          >
            <BiHomeAlt className="sidebar-tab-icon" />
            Dashboard
          </div>
          <div
            className={`sidebar-tab ${activeTab === "dataManagement" ? "active" : ""}`}
            onClick={() => handleTabChange("dataManagement")}
          >
            <BiData className="sidebar-tab-icon" />
            Data Management
          </div>
          <div
            className={`sidebar-tab ${activeTab === "insights" ? "active" : ""}`}
            onClick={() => handleTabChange("insights")}
          >
            <BiLineChart className="sidebar-tab-icon" />
            Insights
          </div>
        </div>
      </div>
      <div className="main-content">
        {/* Page Header */}
        <h1 className="page-header">{renderPageHeader()}</h1>

        {activeTab === "dashboard" && <Dashboard />}

        {activeTab === "dataManagement" && (
          <div>
            <div className="header-section">
              <div className="button-group">
                <button className="add-data-trigger" onClick={openAddDataModal}>
                  Add Data
                </button>
                <button className="add-data-trigger" onClick={openCsvModal}>
                  Upload CSV
                </button>
              </div>
              <DengueDataList />
            </div>
          </div>
        )}

        {activeTab === "insights" && <Insights />}
      </div>

      {/* Add Data Modal */}
      {showAddDataModal && (
        <div className="modal-overlay" onClick={closeAddDataModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Data</h2>
              <button className="modal-close" onClick={closeAddDataModal}>
                &times;
              </button>
            </div>
            <div className="add-data-form">
              <AddDengueData />
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showCsvModal && (
        <div className="modal-overlay" onClick={closeCsvModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload CSV</h2>
              <button className="modal-close" onClick={closeCsvModal}>
                &times;
              </button>
            </div>
            <div className="add-data-form">
              <CsvUpload />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
