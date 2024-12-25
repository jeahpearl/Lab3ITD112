import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Modal from "react-modal";
import { TbDeviceTabletSearch } from "react-icons/tb";
import Swal from "sweetalert2";

Modal.setAppElement("#root");

const DengueDataList = () => {
  const [dataList, setDataList] = useState([]);
  const [filtered, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loader state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    loc: "",
    cases: 0,
    deaths: 0,
    date: "",
    Region: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [setDeleteId] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [startDate, setStartDate] = useState(""); // Start date
  const [endDate, setEndDate] = useState("");     // End date

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filteredData = dataList;
  
    // Apply search filter
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filteredData = filteredData.filter((entry) =>
        Object.keys(entry).some((key) =>
          String(entry[key]).toLowerCase().includes(lowercasedFilter)
        )
      );
    }
  
    // Apply location filter (multiple selection)
    if (selectedLocations.length > 0) {
      filteredData = filteredData.filter((entry) =>
        selectedLocations.includes(entry.loc)
      );
    }
  
    // Apply date range filter
    if (startDate || endDate) {
      filteredData = filteredData.filter((entry) => {
        const entryDate = new Date(entry.date);
        const fromDate = startDate ? new Date(startDate) : null;
        const toDate = endDate ? new Date(endDate) : null;
  
        return (!fromDate || entryDate >= fromDate) && (!toDate || entryDate <= toDate);
      });
    }
  
    setFilteredData(filteredData);
  }, [searchTerm, selectedLocations, startDate, endDate, dataList]);


  const fetchData = async () => {
    try {
      const dataCollection = collection(db, "dengueData");
      const snapshot = await getDocs(dataCollection);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Sort by cases in descending order
      const sortedList = list.sort((a, b) => b.cases - a.cases);
      
      setDataList(sortedList);
      setFilteredData(sortedList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Turn off loader
    }
  };
  
  const handleLocationChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedLocations(selectedOptions);
  };
  

   // Filter data based on search term and selected location
   useEffect(() => {
      let filteredData = dataList;
    
      // Apply search filter
      if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredData = filteredData.filter((entry) =>
          Object.keys(entry).some((key) =>
            String(entry[key]).toLowerCase().includes(lowercasedFilter)
          )
        );
      }
    
      // Apply location filter (multiple selection)
      if (selectedLocations.length > 0) {
        filteredData = filteredData.filter((entry) =>
          selectedLocations.includes(entry.loc)
        );
      }
    
      setFilteredData(filteredData);
    }, [searchTerm, selectedLocations, dataList]);
  
  const uniqueLocations = [...new Set(dataList.map((data) => data.loc))];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = dataList.filter((entry) =>
      Object.keys(entry).some((key) =>
        String(entry[key]).toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, dataList]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = filtered.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    startPage = Math.max(1, endPage - maxPagesToShow + 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  const openDeleteModal = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the data. You cannot undo this action.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id); // Pass the id directly to handleDelete
      }
    });
  };
  
  const handleDelete = async (id) => {
    const dengueDocRef = doc(db, "dengueData", id); // Use the id parameter directly
    try {
      await deleteDoc(dengueDocRef);
      setDataList(dataList.filter((data) => data.id !== id));
      setFilteredData(filtered.filter((data) => data.id !== id));
  
      Swal.fire({
        title: "Deleted!",
        text: "The data has been deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    const { id, ...editableData } = data;
    setEditForm(editableData);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const dengueDocRef = doc(db, "dengueData", editingId);
  
    try {
      await updateDoc(dengueDocRef, {
        loc: editForm.loc,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
        date: editForm.date,
        Region: editForm.Region,
      });
  
      setDataList(
        dataList.map((data) =>
          data.id === editingId
            ? { id: editingId, ...editForm, cases: Number(editForm.cases), deaths: Number(editForm.deaths) }
            : data
        )
      );
  
      Swal.fire({
        title: "Success!",
        text: "Data has been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
  
      setEditingId(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating document: ", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update the data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="data-list-section">
      <div className="search-filter-container">
        {/* Search Input */}
        <div className="search-data-container">
          <TbDeviceTabletSearch className="search-data-icon" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-data-field"
          />
        </div>

        {/* Location Filter */}
        <div className="location-filter-container">
          <label>Filter by Location:</label>
          <select
            multiple
            value={selectedLocations}
            onChange={handleLocationChange}
            className="location-filter"
          >
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="date-filter-container">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-filter-input"
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-filter-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Cases</th>
                <th>Deaths</th>
                <th>Date</th>
                <th>Region</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((data) => (
                <tr key={data.id}>
                  <td>{data.loc}</td>
                  <td>{data.cases}</td>
                  <td>{data.deaths}</td>
                  <td>{data.date}</td>
                  <td>{data.Region}</td>
                  <td>
                    <button className="data-list-button edit" onClick={() => handleEdit(data)}>Edit</button>
                    <button className="data-list-button delete" onClick={() => openDeleteModal(data.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
              Prev
            </button>
            {renderPageNumbers()}
            <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Dengue Data"
        className="modal edit-data-modal"
        overlayClassName="modal-overlay"
      >
        <h2>Edit Data</h2>
        <form onSubmit={handleUpdate} className="edit-data-form">
        <input
          type="text"
          placeholder="Location"
          value={editForm.loc}
          onChange={(e) => setEditForm({ ...editForm, loc: e.target.value })} // Correct key
        />
        <input
          type="number"
          placeholder="Cases"
          value={editForm.cases}
          onChange={(e) => setEditForm({ ...editForm, cases: e.target.value })}
        />
        <input
          type="number"
          placeholder="Deaths"
          value={editForm.deaths}
          onChange={(e) => setEditForm({ ...editForm, deaths: e.target.value })}
        />
        <input
          type="text"
          placeholder="Date"
          value={editForm.date}
          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Region"
          value={editForm.Region}
          onChange={(e) => setEditForm({ ...editForm, Region: e.target.value })} // Correct key
        />
        <button type="submit">Update</button>
      </form>
      </Modal>

     {/* Delete Confirmation Modal */}
       <Modal
         isOpen={isDeleteModalOpen}
         onRequestClose={closeDeleteModal}
         contentLabel="Delete Confirmation"
         className="modal delete-confirmation-modal"
         overlayClassName="modal-overlay"
       >
         <h2>Are you sure you want to delete this data?</h2>
         <p>This will delete this row permanently. You cannot undo this action.</p>
         <div className="modal-footer">
           <button onClick={closeDeleteModal}>Cancel</button>
           <button onClick={handleDelete}>Delete</button>
         </div>
       </Modal>
    </div>
  );
};

export default DengueDataList;
