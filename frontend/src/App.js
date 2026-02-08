/**
 * Todo App - Main Component
 * Manages todo list with CRUD operations, filtering, and editing
 * Includes user authentication, dashboard, and analytics
 */

import { useEffect, useState } from "react";
import axios from "axios";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import DailyChecklist from "./components/DailyChecklist";
import WeeklyView from "./components/WeeklyView";
import MonthlyView from "./components/MonthlyView";
import "./App.css";

// ===== API Configuration =====
const API_URL = "http://localhost:5000/api/todos";

// ===== Constants =====
const INITIAL_FORM_STATE = {
  text: "",
  description: "",
  priority: "medium",
  dueDate: "",
  category: "general"
};

const PRIORITY_COLORS = {
  high: "#ff4757",
  medium: "#ffa502",
  low: "#2ed573"
};

function App() {
  // ===== State Management =====
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("checklist"); // 'checklist', 'weekly', 'monthly', 'tasks', 'dashboard'

  // ===== Lifecycle Hooks =====
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchTodos();
    }
  }, []);

  // ===== API Functions =====

  /**
   * Fetch all todos from the API
   */
  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error.message);
    }
  };

  /**
   * Add or update a todo
   */
  const saveTodo = async () => {
    if (!formData.text.trim()) {
      alert("Please enter a todo title");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        // Update existing todo
        await axios.put(`${API_URL}/${editingId}`, {
          ...formData,
          dueDate: formData.dueDate || null
        }, { headers });
        setEditingId(null);
      } else {
        // Create new todo
        await axios.post(API_URL, {
          ...formData,
          dueDate: formData.dueDate || null
        }, { headers });
      }
      resetForm();
      fetchTodos();
    } catch (error) {
      console.error("Error saving todo:", error.message);
    }
  };

  /**
   * Toggle todo completion status
   */
  const toggleTodo = async (todo) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/${todo._id}`, {
        ...todo,
        completed: !todo.completed
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error.message);
    }
  };

  /**
   * Load todo data into form for editing
   */
  const startEditingTodo = (todo) => {
    setFormData({
      text: todo.text,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : "",
      category: todo.category
    });
    setEditingId(todo._id);
  };

  /**
   * Delete a todo
   */
  const deleteTodo = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error.message);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTodos([]);
    resetForm();
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    fetchTodos();
  };

  // ===== Helper Functions =====

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  /**
   * Get color for priority badge
   */
  const getPriorityColor = (priority) => {
    return PRIORITY_COLORS[priority] || "#666";
  };

  /**
   * Filter todos based on selected filter
   */
  const getFilteredTodos = () => {
    return todos.filter(todo => {
      if (filter === "completed") return todo.completed;
      if (filter === "pending") return !todo.completed;
      return true;
    });
  };

  // ===== Computed Values =====
  const filteredTodos = getFilteredTodos();
  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;
  const isEditing = editingId !== null;

  // ===== Conditional Rendering =====
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const token = localStorage.getItem("token");

  // ===== Render =====
  return (
    <div className="app-container">
      {/* Header with User Info */}
      <div className="header">
        <div className="header-left">
          <h1>📋 Todo Management System</h1>
          <p className="subtitle">Organize, track, and analyze your tasks</p>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "checklist" ? "active" : ""}`}
          onClick={() => setActiveTab("checklist")}
        >
          📅 Daily Checklist
        </button>
        <button
          className={`nav-tab ${activeTab === "weekly" ? "active" : ""}`}
          onClick={() => setActiveTab("weekly")}
        >
          📆 Weekly Habits
        </button>
        <button
          className={`nav-tab ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => setActiveTab("monthly")}
        >
          📊 Monthly Habits
        </button>
        <button
          className={`nav-tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          📋 Task Manager
        </button>
        <button
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📈 Analytics Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "checklist" && (
          <DailyChecklist token={token} />
        )}
        
        {activeTab === "weekly" && (
          <WeeklyView token={token} />
        )}

        {activeTab === "monthly" && (
          <MonthlyView token={token} />
        )}
        
        {activeTab === "tasks" && (
          <TaskManager token={token} onTasksChange={setTodos} />
        )}
        
        {activeTab === "dashboard" && (
          <Dashboard token={token} />
        )}
      </div>
    </div>
  );
}

/**
 * TodoCard Component
 * Displays a single todo item with actions
 */
function TodoCard({ todo, onToggle, onEdit, onDelete, getPriorityColor }) {
  return (
    <div className={`todo-card ${todo.completed ? "completed" : ""}`}>
      <div className="todo-left">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          aria-label="Mark todo as complete"
        />
        <div className="todo-content">
          <h3 className="todo-title">{todo.text}</h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          <div className="todo-meta">
            <span
              className="badge priority"
              style={{ backgroundColor: getPriorityColor(todo.priority) }}
            >
              {todo.priority}
            </span>
            <span className="badge category">{todo.category}</span>
            {todo.dueDate && (
              <span className="badge due-date">
                📅 {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="todo-actions">
        <button
          className="btn btn-edit"
          onClick={() => onEdit(todo)}
          aria-label="Edit todo"
        >
          ✏️
        </button>
        <button
          className="btn btn-delete"
          onClick={() => onDelete(todo._id)}
          aria-label="Delete todo"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default App;
