import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Chart, registerables } from "chart.js";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { PiChartLineDownBold } from "react-icons/pi";
import { FaMosquito } from "react-icons/fa6";
import { TbReportAnalytics } from "react-icons/tb";

import "./Dashboard.css";

Chart.register(...registerables);

const Dashboard = () => {
  const [dengueData, setDengueData] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [topRegions, setTopRegions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dengueCollection = collection(db, "dengueData");
      const snapshot = await getDocs(dengueCollection);
      const data = snapshot.docs.map((doc) => doc.data());
      setDengueData(data);

      // Calculate cases by location
      const locationCases = data.reduce((acc, item) => {
        acc[item.loc] = (acc[item.loc] || 0) + (item.cases || 0);
        return acc;
      }, {});

      const sortedLocations = Object.entries(locationCases)
        .sort((a, b) => b[1] - a[1])
        .map(([loc, cases]) => ({ loc, cases }))
        .slice(0, 5);
      setTopLocations(sortedLocations);

      // Calculate cases by region
      const regionCases = data.reduce((acc, item) => {
        acc[item.Region] = (acc[item.Region] || 0) + (item.cases || 0);
        return acc;
      }, {});

      const sortedRegions = Object.entries(regionCases)
        .sort((a, b) => b[1] - a[1])
        .map(([Region, cases]) => ({ Region, cases }))
        .slice(0, 5);
      setTopRegions(sortedRegions);
    };

    fetchData();
  }, []);

  const totalCases = dengueData.reduce((sum, item) => sum + (item.cases || 0), 0);
  const totalDeaths = dengueData.reduce((sum, item) => sum + (item.deaths || 0), 0);

  // Chart Options with Tooltips Enabled
  const chartOptions = (xLabel, yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
        },
      },
      legend: { display: true },
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
    scales: {
      x: { title: { display: true, text: xLabel } },
      y: { title: { display: true, text: yLabel } },
    },
  });

  // Location-wise Dengue Cases (Bar Chart)
  const locationChartData = {
    labels: topLocations.map((item) => item.loc),
    datasets: [
      {
        label: "Dengue Cases",
        data: topLocations.map((item) => item.cases),
        backgroundColor: "#00A0A0",
      },
    ],
  };

  // Monthly Trend of Cases (Line Chart)
  const monthlyTrendChartData = (() => {
    const monthYearMap = {};

    dengueData.forEach((item) => {
      if (item.date) {
        const parts = item.date.split("/");
        if (parts.length === 3) {
          const [month, day, year] = parts;
          const formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year.slice(-2)}`;
          monthYearMap[formattedDate] = (monthYearMap[formattedDate] || 0) + (item.cases || 0);
        }
      }
    });

    const sortedDates = Object.keys(monthYearMap).sort((a, b) => new Date(b) - new Date(a));

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Monthly Cases",
          data: sortedDates.map((date) => monthYearMap[date]),
          borderColor: "#FFA500",
          backgroundColor: "#FFE4B5",
        },
      ],
    };
  })();

  // Cases vs Deaths (Scatter Plot)
  const scatterChartData = {
    datasets: [
      {
        label: "Cases vs Deaths",
        data: dengueData.map((item) => ({
          x: item.cases || 0,
          y: item.deaths || 0,
        })),
        backgroundColor: "#FF4500",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* Top Metrics */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-title">
            <FaMosquito className="metric-icon" />
            Total Cases
          </div>
          <span>{totalCases}</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <PiChartLineDownBold className="metric-icon" />
            Total Deaths
          </div>
          <span>{totalDeaths}</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">
            <TbReportAnalytics className="metric-icon" />
            Total Reports
          </div>
          <span>{dengueData.length}</span>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Top 5 Locations by Dengue Cases</h3>
          <Bar data={locationChartData} options={chartOptions("Location", "Cases")} />
        </div>
        <div className="chart-card">
          <h3>Monthly Trend of Cases</h3>
          <Line data={monthlyTrendChartData} options={chartOptions("Date (MM/DD/YY)", "Cases")} />
        </div>
        <div className="chart-card wide">
          <h3>Cases vs Deaths</h3>
          <Scatter data={scatterChartData} options={chartOptions("Cases", "Deaths")} />
        </div>
      </div>

      {/* Top Regions Table */}
      <div className="top-locations">
        <h3>Top 5 Regions by Dengue Cases</h3>
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Cases</th>
            </tr>
          </thead>
          <tbody>
            {topRegions.map((region, index) => (
              <tr key={index}>
                <td>{region.Region}</td>
                <td>{region.cases}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
