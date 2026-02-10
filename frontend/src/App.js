import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import DailyChecklist from "./components/DailyChecklist";
import WeeklyView from "./components/WeeklyView";
import MonthlyView from "./components/MonthlyView";
import "./App.css";

const API_URL = "http://localhost:5000/api/todos";


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
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("checklist"); 

  // ===== API Functions =====

  /**
   * Fetch all todos from the API
   */
  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error.message);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const saveTodo = async () => {
    if (!formData.text.trim()) {
      alert("Please enter a todo title");
      return;
    }

    try {
      if (editingId) {
     
        await axios.put(`${API_URL}/${editingId}`, {
          ...formData,
          dueDate: formData.dueDate || null
        });
        setEditingId(null);
      } else {
     
        await axios.post(API_URL, {
          ...formData,
          dueDate: formData.dueDate || null
        });
      }
      resetForm();
      fetchTodos();
    } catch (error) {
      console.error("Error saving todo:", error.message);
    }
  };

  const toggleTodo = async (todo) => {
    try {
      await axios.put(`${API_URL}/${todo._id}`, {
        ...todo,
        completed: !todo.completed
      });
      fetchTodos();
    } catch (error) {
      console.error("Error toggling todo:", error.message);
    }
  };

 
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

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setTodos([]);
    resetForm();
  };

 
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
  };

 
  const getPriorityColor = (priority) => {
    return PRIORITY_COLORS[priority] || "#666";
  };

 
  const getFilteredTodos = () => {
    return todos.filter(todo => {
      if (filter === "completed") return todo.completed;
      if (filter === "pending") return !todo.completed;
      return true;
    });
  };

  const filteredTodos = getFilteredTodos();
  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;
  const isEditing = editingId !== null;

  return (
    <div className="app-container">
      {/* Header with App Info */}
      <div className="header">
        <div className="header-left">
          <h1>📋 Todo Management System</h1>
          <p className="subtitle">Organize, track, and analyze your tasks</p>
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
          <DailyChecklist />
        )}
        
        {activeTab === "weekly" && (
          <WeeklyView />
        )}

        {activeTab === "monthly" && (
          <MonthlyView />
        )}
        
        {activeTab === "tasks" && (
          <TaskManager onTasksChange={setTodos} />
        )}
        
        {activeTab === "dashboard" && (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

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