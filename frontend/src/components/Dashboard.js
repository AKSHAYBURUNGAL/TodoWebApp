import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/Dashboard.css";

const Dashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/todos/analytics/dashboard/overview",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard error">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="dashboard">No data available</div>;
  }

  const { statistics, dailyTrends, weeklyTrends, monthlyTrends, completionHistory } = dashboardData;

  const pieData = [
    { name: "Completed", value: statistics.completedTasks },
    { name: "Pending", value: statistics.pendingTasks },
  ];

  const COLORS = ["#4CAF50", "#FF9800"];

  const priorityData = [
    { name: "Low", value: statistics.byPriority.low },
    { name: "Medium", value: statistics.byPriority.medium },
    { name: "High", value: statistics.byPriority.high },
  ];

  const PRIORITY_COLORS = ["#2196F3", "#FF9800", "#F44336"];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Productivity Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-value">{statistics.totalTasks}</p>
        </div>
        <div className="stat-card success">
          <h3>Completed</h3>
          <p className="stat-value">{statistics.completedTasks}</p>
        </div>
        <div className="stat-card warning">
          <h3>Pending</h3>
          <p className="stat-value">{statistics.pendingTasks}</p>
        </div>
        <div className="stat-card info">
          <h3>Completion Rate</h3>
          <p className="stat-value">{statistics.completionPercentage}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Daily Trends */}
        <div className="chart-container">
          <h2>Daily Trends (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dailyTrends}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#8884d8"
                strokeWidth={2}
                name="Completion %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trends */}
        <div className="chart-container">
          <h2>Weekly Trends (Last 12 Weeks)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyTrends}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#82ca9d" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie Chart */}
        <div className="chart-container">
          <h2>Task Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="chart-container">
          <h2>Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={priorityData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="Count">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="chart-container">
          <h2>Monthly Trends (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyTrends}
              margin={{ top: 5, right: 30, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#ff7300"
                strokeWidth={2}
                name="Completion %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Completion History */}
        <div className="chart-container">
          <h2>Completion History (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={completionHistory}
              margin={{ top: 5, right: 30, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="displayDate"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasksCompleted" fill="#4CAF50" name="Tasks Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
