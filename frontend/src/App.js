import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import DailyChecklist from "./components/DailyChecklist";
import WeeklyView from "./components/WeeklyView";
import MonthlyView from "./components/MonthlyView";
import AuthScreen from "./components/AuthScreen";
import Icon from "./components/Icon";
import API_BASE_URL, { AUTH_API_BASE_URL } from "./config/apiConfig";
import buddhaBackground from "./assets/buddha-statue-with-flowers.jpg";
import "./App.css";

// Use environment variable for API URL, with fallback to relative path for development
const API_URL = process.env.REACT_APP_API_URL || API_BASE_URL || "/api/todos";


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

const CURRENT_USER_STORAGE_KEY = "todo-auth-session";

const NAV_TABS = [
  { id: "checklist", label: "Daily Checklist", icon: "calendarDay" },
  { id: "weekly", label: "Weekly Habits", icon: "calendarWeek" },
  { id: "monthly", label: "Monthly Habits", icon: "calendarMonth" },
  { id: "tasks", label: "Task Manager", icon: "clipboard" },
  { id: "dashboard", label: "Analytics Dashboard", icon: "analytics" },
];

const TAB_REFLECTIONS = {
  checklist: "Begin with clarity and let each small completion quiet the day.",
  weekly: "Consistency carries more power than intensity when the week gets busy.",
  monthly: "Gentle repetition turns intention into visible progress over time.",
  tasks: "Choose one task, do it well, and let momentum build from there.",
  dashboard: "Reflection brings calm focus to the work that truly matters.",
};

const normalizeUserName = (name) => name.trim().replace(/\s+/g, " ");

const applyAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

const readCurrentSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    const session = rawSession ? JSON.parse(rawSession) : null;

    if (session?.token) {
      applyAuthToken(session.token);
    }

    return session;
  } catch (error) {
    console.error("Error reading current session:", error.message);
    return null;
  }
};

const saveCurrentSession = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(session));
};

const clearCurrentSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("checklist"); 
  const [currentUser, setCurrentUser] = useState(() => readCurrentSession());
  const [authStatus, setAuthStatus] = useState(() =>
    readCurrentSession()?.token ? "checking" : "guest"
  );

  // ===== API Functions =====

  /**
   * Fetch all todos from the API
   */
  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        handleLogout();
        return;
      }
      console.error("Error fetching todos:", error.message);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const validateSession = async () => {
      if (!currentUser?.token) {
        applyAuthToken(null);
        setAuthStatus("guest");
        return;
      }

      applyAuthToken(currentUser.token);

      try {
        const response = await axios.get(`${AUTH_API_BASE_URL}/me`);

        if (isCancelled) {
          return;
        }

        const normalizedSession = {
          ...currentUser,
          id: response.data.user.id,
          name: response.data.user.name,
        };

        saveCurrentSession(normalizedSession);
        setCurrentUser(normalizedSession);
        setAuthStatus("authenticated");
        await fetchTodos();
      } catch (error) {
        if (isCancelled) {
          return;
        }

        clearCurrentSession();
        applyAuthToken(null);
        setCurrentUser(null);
        setTodos([]);
        setAuthStatus("guest");
      }
    };

    validateSession();

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.token]);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          clearCurrentSession();
          applyAuthToken(null);
          setCurrentUser(null);
          setTodos([]);
          setAuthStatus("guest");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
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
    clearCurrentSession();
    applyAuthToken(null);
    setCurrentUser(null);
    setTodos([]);
    setAuthStatus("guest");
    resetForm();
  };

  const handleLogin = async (name) => {
    const displayName = normalizeUserName(name);

    if (!displayName) {
      return { error: "Please enter your name." };
    }

    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/login`, {
        name: displayName,
      });

      const session = {
        id: response.data.user.id,
        name: response.data.user.name,
        token: response.data.token,
      };

      applyAuthToken(session.token);
      saveCurrentSession(session);
      setAuthStatus("authenticated");
      setCurrentUser(session);
      return { success: true };
    } catch (error) {
      const fallbackMessage = error?.request
        ? "Cannot reach the backend. Check your API URL and backend server."
        : "Unable to log in right now.";

      return {
        error: error?.response?.data?.error || fallbackMessage,
      };
    }
  };

  const handleRegister = async (name) => {
    const displayName = normalizeUserName(name);

    if (!displayName) {
      return { error: "Please enter your name." };
    }

    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/register`, {
        name: displayName,
      });

      const session = {
        id: response.data.user.id,
        name: response.data.user.name,
        token: response.data.token,
      };

      applyAuthToken(session.token);
      saveCurrentSession(session);
      setAuthStatus("authenticated");
      setCurrentUser(session);
      return { success: true };
    } catch (error) {
      const fallbackMessage = error?.request
        ? "Cannot reach the backend. Check your API URL and backend server."
        : "Unable to register right now.";

      return {
        error: error?.response?.data?.error || fallbackMessage,
      };
    }
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
  const activeTabConfig =
    NAV_TABS.find((tab) => tab.id === activeTab) || NAV_TABS[0];
  const activeReflection =
    TAB_REFLECTIONS[activeTab] || TAB_REFLECTIONS.checklist;

  return (
    <div
      className="app-shell"
      style={{ "--app-bg-image": `url(${buddhaBackground})` }}
    >
      <div className="ambient-orb ambient-orb-left"></div>
      <div className="ambient-orb ambient-orb-right"></div>
      <div className="ambient-orb ambient-orb-gold"></div>

      <div className="app-container">
        {authStatus === "checking" ? (
          <div className="auth-layout">
            <div className="auth-card">
              <div className="auth-badge">
                <Icon name="sparkles" size={16} />
                <span>Simple access</span>
              </div>
              <h1 className="auth-title">Checking your session</h1>
              <p className="auth-copy">
                Restoring your workspace before the dashboard opens.
              </p>
            </div>
          </div>
        ) : !currentUser ? (
          <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
        ) : (
          <>
        {/* Header with App Info */}
        <div className="header">
          <div className="header-left">
            <p className="header-eyebrow">Mindful productivity, tuned for your phone</p>
            <h1 className="title-with-icon">
              <Icon name="clipboard" className="title-icon" />
              <span>Todo Management System</span>
            </h1>
            <p className="subtitle">
              Plan, review, and finish tasks inside a calmer workspace with soft focus and clear priorities.
            </p>
            <div className="header-mantra">
              <Icon name="sparkles" size={18} />
              <span>Calm mind. Clear list. Steady progress.</span>
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <div className="user-pill">
                <Icon name="user" size={16} />
                <span>{currentUser.name}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <span className="button-with-icon">
                  <Icon name="logout" size={17} />
                  <span>Logout</span>
                </span>
              </button>
            </div>

            <div className="focus-card">
              <span className="focus-card-label">Active focus</span>
              <div className="focus-card-title">
                <Icon name={activeTabConfig.icon} size={18} />
                <span>{activeTabConfig.label}</span>
              </div>
              <p className="focus-card-copy">{activeReflection}</p>
            </div>

            <div className="stat-cluster">
              <div className="glass-stat">
                <span className="glass-stat-label">Total</span>
                <strong className="glass-stat-value">{todos.length}</strong>
              </div>
              <div className="glass-stat">
                <span className="glass-stat-label">Done</span>
                <strong className="glass-stat-value">{completedCount}</strong>
              </div>
              <div className="glass-stat">
                <span className="glass-stat-label">Pending</span>
                <strong className="glass-stat-value">{pendingCount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-tab-content">
                <Icon name={tab.icon} className="nav-tab-icon" />
                <span className="nav-tab-text">{tab.label}</span>
              </span>
            </button>
          ))}
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
          </>
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
              <span className="badge due-date badge-with-icon">
                <Icon name="calendarDay" size={14} className="meta-icon" />
                <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="todo-actions">
        <button
          className="btn btn-edit icon-button"
          onClick={() => onEdit(todo)}
          aria-label="Edit todo"
        >
          <Icon name="edit" size={18} />
        </button>
        <button
          className="btn btn-delete icon-button"
          onClick={() => onDelete(todo._id)}
          aria-label="Delete todo"
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
    </div>
  );
}

export default App;
