import React, { useState, useEffect } from "react";
import baseApi from "../../constants/apiUrl";
import { useNavigate } from "react-router-dom";

const CommissionManagement = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    commissionStatus: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "earned", "payable"
  const [formData, setFormData] = useState({
    dealValue: "",
    note: "",
  });

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${baseApi}/getAllRequests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      // Filter to show only this partner's assignments
      let allAssignments = [];
      if (Array.isArray(data)) {
        allAssignments = data;
      } else if (data.success || data.data) {
        allAssignments = Array.isArray(data.data) ? data.data : [];
      }

      // Get current user to filter by partnerId
      const userResponse = await fetch(`${baseApi}/getUserById`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();
      const currentUserId = userData?.data?.userId;

      // Filter assignments for this partner
      const filtered = allAssignments.filter(
        (item) => item.partnerId === currentUserId
      );

      // Fetch agent details for all assignments
      const assignmentsWithAgentDetails = await Promise.all(
        filtered.map(async (item) => {
          if (item.agentId) {
            try {
              const agentResponse = await fetch(`${baseApi}/getUserById?userId=${item.agentId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const agentData = await agentResponse.json();
              if (agentData.success && agentData.data) {
                return { ...item, agentDetails: agentData.data };
              }
            } catch (err) {
              console.error(`Error fetching agent ${item.agentId}:`, err);
            }
          }
          return item;
        })
      );

      setAssignments(assignmentsWithAgentDetails);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      alert("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCommissionEarned = (assignment) => {
    setSelectedAssignment(assignment);
    setModalType("earned");
    setFormData({ dealValue: "", note: "" });
    setShowModal(true);
  };

  const handleMarkCommissionPayable = (assignment) => {
    setSelectedAssignment(assignment);
    setModalType("payable");
    setFormData({ note: "" });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        navigate("/");
        return;
      }

      const action = modalType === "earned" ? "commissionEarned" : "commissionPayable";
      
      // Ensure no trailing slash in URL
      const apiUrl = `${baseApi}/markAsDoneAndCalculateCommission`.replace(/\/+$/, '');
      
      console.log("Calling API:", apiUrl, {
        applicationId: selectedAssignment.applicationId,
        action: action,
        dealValue: modalType === "earned" ? parseFloat(formData.dealValue) : undefined,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedAssignment.applicationId,
          action: action,
          dealValue: modalType === "earned" ? parseFloat(formData.dealValue) : undefined,
          note: formData.note,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowModal(false);
        fetchAssignments();
      } else {
        alert(data.message || "Failed to update commission");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred: ${error.message || "Please check console for details"}`);
    }
  };

  const getCommissionStatusColor = (status) => {
    const colors = {
      "Not Earned": "bg-gray-100 text-gray-800",
      "Earned": "bg-blue-100 text-blue-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Paid": "bg-green-100 text-green-800",
      "Reversed": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.agentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesCommissionStatus =
      !filters.commissionStatus ||
      item.commissionInfo?.commissionStatus === filters.commissionStatus;
    return matchesSearch && matchesStatus && matchesCategory && matchesCommissionStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Commission Management
        </h1>
        <p className="text-gray-600 mt-2">Mark applications as done and manage commissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Application ID, Agent, Category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              <option value="Property">Property</option>
              <option value="Installment">Installment</option>
              <option value="Loan">Loan</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Status
            </label>
            <select
              value={filters.commissionStatus}
              onChange={(e) =>
                setFilters({ ...filters, commissionStatus: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Commission Statuses</option>
              <option value="Not Earned">Not Earned</option>
              <option value="Earned">Earned</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.applicationId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.agentId || "N/A"}</div>
                      {item.agentDetails && (
                        <div className="text-xs text-gray-500 mt-1">
                          <p>{item.agentDetails.name || ""}</p>
                          <p>{item.agentDetails.email || ""}</p>
                          {item.agentDetails.phoneNumber && <p>📞 {item.agentDetails.phoneNumber}</p>}
                          {item.agentDetails.BankAccountinfo && item.agentDetails.BankAccountinfo.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="font-bold text-gray-700">Bank Account:</p>
                              {item.agentDetails.BankAccountinfo.map((account, idx) => (
                                <div key={idx} className="text-xs">
                                  <p>{account.bankName || "N/A"}</p>
                                  <p>Account: {account.accountNumber || "N/A"}</p>
                                  <p>Name: {account.accountName || "N/A"}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        PKR{" "}
                        {item.commissionInfo?.eligibleCommission?.toLocaleString() || "0"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.commissionInfo?.commissionStatus || "Not Earned"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCommissionStatusColor(
                          item.commissionInfo?.commissionStatus || "Not Earned"
                        )}`}
                      >
                        {item.commissionInfo?.commissionStatus || "Not Earned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                      {!item.commissionInfo?.commissionEarned && (
                        <button
                          onClick={() => handleMarkCommissionEarned(item)}
                          className="block text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Mark Earned
                        </button>
                      )}
                      {item.commissionInfo?.commissionEarned &&
                        !item.commissionInfo?.commissionPayable && (
                          <button
                            onClick={() => handleMarkCommissionPayable(item)}
                            className="block text-yellow-600 hover:text-yellow-900 font-medium"
                          >
                            Mark Payable
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {modalType === "earned"
                ? "Mark Commission as Earned"
                : "Mark Commission as Payable"}
            </h3>
            <div className="space-y-4">
              {modalType === "earned" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Value (PKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.dealValue}
                    onChange={(e) =>
                      setFormData({ ...formData, dealValue: e.target.value })
                    }
                    placeholder="Enter deal value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionManagement;
