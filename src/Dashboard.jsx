import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; 
import { FiHome, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import SideBar from "./components/SideBar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]); // State to store the logs
  const [stats, setStats] = useState(null); // State to store the request statistics
  const navigate = useNavigate();

  // Fetch logs and statistics from the API
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }

    // Fetch activity logs from API
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(response.data); // Set logs in the state directly from the response
        console.log(response.data); // Log the response data for debugging
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    // Fetch statistics from the API
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/request/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data); // Set stats in the state directly from the response
        console.log(response.data); // Log the response data for debugging
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchLogs();
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white p-4 shadow-md flex justify-between items-center rounded-lg">
          <h1 className="text-2xl font-semibold text-gray-700">User, {user?.name} 🎉</h1>
          <p className="text-gray-600">Role: {user?.role}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {stats ? (
            <>
              <div className="bg-blue-500 text-white p-5 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">Total Requests</h2>
                <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
              </div>

              {stats.statusCounts.map((stat, index) => {
                // Dynamically determine background color based on stat.status
                let bgColor = 'bg-green-500'; // Default color
                if (stat.status === "under-repair") {
                  bgColor = 'bg-red-400'; // If status is under-repair
                } else if (stat.status === "pending") {
                  bgColor = 'bg-yellow-500'; // If status is pending
                } else if (stat.status === "damaged") {
                  bgColor = 'bg-red-500'; // If status is pending
                } else if (stat.status === "denied") {
                  bgColor = 'bg-cyan-500'; // If status is pending
                }
                
                return (
                <div key={index} className={`${bgColor} text-white p-5 rounded-lg shadow-md`}>
                  <h2 className="text-lg font-semibold">{stat.status}</h2>
                  <p className="text-3xl font-bold mt-2">{stat.count}</p>
                </div>
                );
            })}
            </>
          ) : (
            <div className="col-span-4 text-center p-5 text-gray-600">Loading stats...</div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <ul className="text-gray-600">
            {logs.length === 0 ? (
              <li className="mb-2">No recent activity.</li>
            ) : (
              logs.map((log, index) => (
                <li key={index} className="mb-2">
                  {log.action.startsWith("Created") && "✔ "} {/* Customize based on action */}
                  {log.action === "User logged in" && "🔄 "}
                  {log.action.startsWith("Deleted") && "❌ "}
                  {log.action}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
