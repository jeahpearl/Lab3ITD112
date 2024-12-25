import React, { useState, useEffect } from "react";
import { Line, Doughnut, Bubble, Bar } from "react-chartjs-2";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import geoJsonData from "../../map_data/ph.json";
import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "./Insights.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Insights = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("trends");
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedDataFilter, setSelectedDataFilter] = useState("both"); // New state for filter
  const [selectedLocations, setSelectedLocations] = useState([]); // New state for location filter

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "dengueData")); // Use dengueData collection
      const rawData = snapshot.docs.map((doc) => doc.data());
      setData(rawData);
    };

    fetchData();
  }, []);

  // List of months for the dropdown
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Filtered Density Plot Data
  const densityPlotData = (() => {
    const dateMap = {};

    data.forEach((item) => {
      if (item.date) {
        const parts = item.date.split("/"); // Format: MM/DD/YYYY
        if (parts.length === 3) {
          const [month, day, year] = parts;
          const formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year.slice(-2)}`;

          if (
            selectedMonths.length === 0 || // Show all months if no filter applied
            selectedMonths.includes(month.padStart(2, "0"))
          ) {
            if (!dateMap[formattedDate]) {
              dateMap[formattedDate] = { cases: 0, deaths: 0 };
            }
            dateMap[formattedDate].cases += item.cases || 0;
            dateMap[formattedDate].deaths += item.deaths || 0;
          }
        }
      }
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(b) - new Date(a));

    // Dynamically construct datasets based on the selected filter
    const datasets = [];
    if (selectedDataFilter === "cases" || selectedDataFilter === "both") {
      datasets.push({
        label: "Cases",
        data: sortedDates.map((date) => dateMap[date].cases),
        borderColor: "#00A0A0",
        backgroundColor: "rgba(0, 160, 160, 0.2)",
        tension: 0.4,
        pointRadius: 4,
        fill: true,
      });
    }
    if (selectedDataFilter === "deaths" || selectedDataFilter === "both") {
      datasets.push({
        label: "Deaths",
        data: sortedDates.map((date) => dateMap[date].deaths),
        borderColor: "#FF4500",
        backgroundColor: "rgba(255, 69, 0, 0.2)",
        tension: 0.4,
        pointRadius: 4,
        fill: true,
      });
    }

    return { labels: sortedDates, datasets };
  })();

  // Month Filter Change Handler
  const handleMonthChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedMonths(selectedOptions);
  };

  // Reset Filters
  const resetFilters = () => {
    setSelectedMonths([]);
    setSelectedDataFilter("both");
  };

  // Data Filter Change Handler
  const handleDataFilterChange = (event) => {
    setSelectedDataFilter(event.target.value);
  };

    
  // 2. Choropleth Map
  const regionNameMapping = useMemo(
    () => ({
      "REGION X-NORTHERN MINDANAO": "Northern Mindanao",
      "REGION IX-ZAMBOANGA PENINSULA": "Zamboanga Peninsula",
      "CAR": "Cordillera Administrative Region",
      "BARMM": "Autonomous Region in Muslim Mindanao",
      "REGION XII-SOCCSKSARGEN": "Soccsksargen",
      "REGION XI-DAVAO REGION": "Davao",
      "REGION VIII-EASTERN VISAYAS": "Eastern Visayas",
      "REGION VII-CENTRAL VISAYAS": "Central Visayas",
      "REGION VI-WESTERN VISAYAS": "Western Visayas",
      "REGION V-BICOL REGION": "Bicol",
      "REGION IV-B-MIMAROPA": "Mimaropa",
      "REGION IV-A-CALABARZON": "Calabarzon",
      "REGION III-CENTRAL LUZON": "Central Luzon",
      "REGION II-CAGAYAN VALLEY": "Cagayan Valley",
      "REGION I-ILOCOS REGION": "Ilocos",
      "NATIONAL CAPITAL REGION": "National Capital Region",
      "CARAGA": "Caraga",
    }),
    []
  );

    useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "dengueData"));
      const rawData = snapshot.docs.map((doc) => doc.data());
      const processedData = rawData.map((item) => ({
        ...item,
        region: regionNameMapping[item.Region] || item.Region,
      }));
      setData(processedData);
    };

    fetchData();
  }, [regionNameMapping]);

  const getColor = (cases) => {
    return cases > 20000
      ? "#800026"
      : cases > 15000
      ? "#BD0026"
      : cases > 10000
      ? "#E31A1C"
      : cases > 5000
      ? "#FC4E2A"
      : cases > 2500
      ? "#FD8D3C"
      : cases > 1000
      ? "#FEB24C"
      : cases > 10
      ? "#FED976"
      : "#FFEDA0";
  };

  const MapChart = ({ data }) => {
    // Normalize Firebase data to match GeoJSON properties
    const normalizeRegionName = (region) => {
      return regionNameMapping[region] || region; // Default to original if no mapping exists
    };
  
    // Aggregate cases and deaths by region
    const aggregatedRegionData = data.reduce((acc, item) => {
      const normalizedRegion = normalizeRegionName(item.Region);
      if (!acc[normalizedRegion]) {
        acc[normalizedRegion] = { cases: 0, deaths: 0 };
      }
      acc[normalizedRegion].cases += item.cases || 0;
      acc[normalizedRegion].deaths += item.deaths || 0;
      return acc;
    }, {});
  
    // Merge aggregated data into GeoJSON features
    const mergedGeoJSON = {
      ...geoJsonData,
      features: geoJsonData.features.map((feature) => {
        const normalizedRegion = normalizeRegionName(feature.properties.name);
        const regionData = aggregatedRegionData[normalizedRegion];
        if (regionData) {
          feature.properties.cases = regionData.cases;
          feature.properties.deaths = regionData.deaths;
        } else {
          feature.properties.cases = 0;
          feature.properties.deaths = 0;
        }
        return feature;
      }),
    };
  
    return (
      <MapContainer center={[13, 122]} zoom={6} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={mergedGeoJSON}
          style={(feature) => ({
            fillColor: getColor(feature.properties.cases),
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
          })}
          onEachFeature={(feature, layer) => {
            const { name, cases, deaths } = feature.properties;
            layer.bindTooltip(
              `<strong>${name}</strong><br>Cases: ${cases}<br>Deaths: ${deaths}`,
              { sticky: true }
            );
          }}
        />
      </MapContainer>
    );
  };  
  
  // 3. Comparisons: Stacked Bar Chart (Location: Cases and Deaths)
  const comparisonBarOptions = {
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true, // Ensure x-axis is stacked
      },
      y: {
        stacked: true, // Ensure y-axis is stacked
        title: {
          display: true,
          text: "Number of Cases/Deaths",
        },
      },
    },
  };

   // Filter the Bar Chart Data Based on Selected Locations
  const comparisonBarData = (() => {
    const locationDataMap = {};

    // Group data by location, aggregating cases and deaths
    data.forEach((item) => {
      if (item.loc && item.cases !== undefined && item.deaths !== undefined) {
        if (!locationDataMap[item.loc]) {
          locationDataMap[item.loc] = { cases: 0, deaths: 0 };
        }
        locationDataMap[item.loc].cases += Number(item.cases) || 0;
        locationDataMap[item.loc].deaths += Number(item.deaths) || 0;
      }
    });

    // Filter locations based on selectedLocations
    const locations = Object.keys(locationDataMap).filter(
      (loc) => selectedLocations.length === 0 || selectedLocations.includes(loc)
    );

    return {
      labels: locations, // X-axis: Locations
      datasets: [
        {
          label: "Cases",
          data: locations.map((loc) => locationDataMap[loc].cases),
          backgroundColor: "#00A0A0", // Teal for cases
        },
        {
          label: "Deaths",
          data: locations.map((loc) => locationDataMap[loc].deaths),
          backgroundColor: "#FF4500", // Red for deaths
        },
      ],
    };
  })();

  // Multi-Select Change Handler
  const handleLocationChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedLocations(selectedOptions);
  };

  // Reset Filters
  const resetLocationFilter = () => {
    setSelectedLocations([]); // Clear the location filter
  };
  
  // 4. Proportions: Doughnut Chart (Cases by Region)
  const regionCasesData = (() => {
    const regionMap = {};

    // Aggregate cases by region
    data.forEach((item) => {
      if (item.Region && item.cases) {
        if (!regionMap[item.Region]) {
          regionMap[item.Region] = 0;
        }
        regionMap[item.Region] += Number(item.cases);
      }
    });

    // Extract labels and values for the chart
    const labels = Object.keys(regionMap);
    const values = Object.values(regionMap);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#FF5733", "#33FF57", "#3357FF", "#FFC300", "#DAF7A6",
            "#FF33F6", "#8E44AD", "#F39C12", "#16A085", "#2980B9",
          ],
        },
      ],
    };
  })();

  // Predefined colors for regions
  const regionColorMap = {
    "#region": "#CCCCCC",              // Placeholder color
    "REGION V-BICOL REGION": "#FF33F6", // Pink
    "REGION III-CENTRAL LUZON": "#FF5733", // Orange
    "Region II-CAGAYAN VALLEY": "#33FF57", // Green
    "REGION IV-A-CALABARZON": "#3357FF", // Blue
    "Region I-ILOCOS REGION": "#FFC300", // Yellow
    "REGION IVB-MIMAROPA": "#DAF7A6",    // Light Green
    "REGION VI-WESTERN VISAYAS": "#FF69B4", // Hot Pink
    "REGION VII-CENTRAL VISAYAS": "#8E44AD", // Purple
    "REGION VII-EASTERN VISAYAS": "#16A085", // Teal
    "REGION IX-ZAMBOANGA PENINSULA": "#2980B9", // Light Blue
    "REGION X-NORTHERN MINDANAO": "#C0392B",   // Red
    "REGION XI-DAVAO REGION": "#7D3C98",       // Dark Purple
    "CAR": "#95A5A6",               // Gray
    "CARAGA": "#1ABC9C",            // Aqua
    "BARMM": "#F39C12",             // Yellow-Orange
    "NATIONAL CAPITAL REGION": "#E74C3C", // Bright Red
    "REGION XII-SOCCSKSARGEN": "#2C3E50",  // Dark Blue
  };
  
  // Fallback for unknown regions
  const getRegionColor = (region) => regionColorMap[region] || "#CCCCCC";

  // 5. Relationships: Bubble Chart (Cases vs Deaths per Region)
  const scatterData = (() => {
    const regionDataMap = {};

    // Aggregate cases and deaths by region
    data.forEach((item) => {
      if (item.Region && item.cases !== undefined && item.deaths !== undefined) {
        if (!regionDataMap[item.Region]) {
          regionDataMap[item.Region] = { cases: 0, deaths: 0 };
        }
        regionDataMap[item.Region].cases += Number(item.cases) || 0;
        regionDataMap[item.Region].deaths += Number(item.deaths) || 0;
      }
    });

    // Prepare datasets for each region with unique colors
    const datasets = Object.keys(regionDataMap).map((region) => ({
      label: region, // Region name
      data: [
        {
          x: regionDataMap[region].cases,
          y: regionDataMap[region].deaths,
          r: 10, // Fixed bubble size
        },
      ],
      backgroundColor: getRegionColor(region), // Assign color
      borderColor: getRegionColor(region),
      borderWidth: 1,
    }));

    return { datasets };
  })();

  const scatterOptions = {
    plugins: {
      legend: {
        display: true,
        position: "top", // Show legend at the top
        labels: {
          color: "#E0FFFF", // Light text for legend labels
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const region = context.dataset.label;
            const cases = context.raw.x;
            const deaths = context.raw.y;
            return `${region}: Cases - ${cases}, Deaths - ${deaths}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Total Cases",
          color: "#E0FFFF",
        },
        ticks: { color: "#E0FFFF" },
        grid: { color: "#444" },
      },
      y: {
        title: {
          display: true,
          text: "Total Deaths",
          color: "#E0FFFF",
        },
        ticks: { color: "#E0FFFF" },
        grid: { color: "#444" },
      },
    },
  };
  
  return (
    <div className="insights-container">
      <div className="tabs">
        {["Trends", "Maps", "Comparisons", "Proportions", "Relationships"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`tab-button ${activeTab === tab.toLowerCase() ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="content">
      {activeTab === "trends" && (
          <>
            <div className="filter-container">
              <label htmlFor="month-filter">Filter by Month:</label>
              <select
                id="month-filter"
                multiple
                value={selectedMonths}
                onChange={handleMonthChange}
                className="month-filter"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <label htmlFor="data-filter" style={{ marginLeft: "20px" }}>Show:</label>
              <select
                id="data-filter"
                value={selectedDataFilter}
                onChange={handleDataFilterChange}
                className="data-filter"
              >
                <option value="both">Cases & Deaths</option>
                <option value="cases">Cases Only</option>
                <option value="deaths">Deaths Only</option>
              </select>
              <button onClick={resetFilters} className="reset-button">
                Reset
              </button>
            </div>
            <div className="chart-card">
              <h3>Density Plot: Cases & Deaths Over Time</h3>
              <Line data={densityPlotData} options={{ maintainAspectRatio: false }} />
            </div>
          </>
        )}
      {activeTab === "maps" && (
        <div className="chart-card">
          <h3>Choropleth Map: Dengue Cases and Deaths</h3>
          <MapChart data={data} options={{ maintainAspectRatio: false }} />
        </div>
      )}
      {activeTab === "comparisons" && (
          <>
          <div className="filter-container">
            <label htmlFor="location-filter">Filter by Location:</label>
            <select
              id="location-filter"
              multiple
              value={selectedLocations}
              onChange={handleLocationChange}
              className="location-filter"
            >
              {/* Populate dropdown with unique locations */}
              {[...new Set(data.map((item) => item.loc))].map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <button onClick={resetLocationFilter} className="reset-button">
              Reset
            </button>
          </div>

          <div className="chart-card">
            <h3>Stacked Bar Chart: Cases and Deaths by Location</h3>
            <Bar data={comparisonBarData} options={comparisonBarOptions} />
          </div>
          </>
        )}
      {activeTab === "proportions" && (
        <div className="chart-card">
          <h3>Doughnut Chart: Cases by Region</h3>
          <Doughnut data={regionCasesData} options={{ maintainAspectRatio: false }} />
        </div>
      )}

      {activeTab === "relationships" && (
        <div className="chart-card">
          <h3>Scatter Plot: Cases vs Deaths per Region</h3>
          <Bubble data={scatterData} options={scatterOptions} />
        </div>
      )}
      </div>
    </div>
  );
};

export default Insights;
