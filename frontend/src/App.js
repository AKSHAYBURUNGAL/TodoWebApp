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
import { NAV_TABS, TAB_REFLECTIONS } from "./config/appShell";
import buddhaBackground from "./assets/buddha-statue-with-flowers.jpg";
import {
  applyAuthToken,
  clearCurrentSession,
  normalizeUserName,
  readCurrentSession,
  saveCurrentSession,
} from "./utils/authSession";
import "./App.css";

const API_URL = API_BASE_URL;
const initialSession = readCurrentSession();

function App() {
  const [todos, setTodos] = useState([]);
  const [activeTab, setActiveTab] = useState("checklist");
  const [currentUser, setCurrentUser] = useState(() => initialSession);
  const [authStatus, setAuthStatus] = useState(() =>
    initialSession?.token ? "authenticated" : "guest"
  );

  const handleLogout = () => {
    clearCurrentSession();
    applyAuthToken(null);
    setCurrentUser(null);
    setTodos([]);
    setAuthStatus("guest");
  };

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

    const restoreSession = async () => {
      if (!currentUser?.token) {
        applyAuthToken(null);
        setTodos([]);
        setAuthStatus("guest");
        return;
      }

      applyAuthToken(currentUser.token);
      setAuthStatus("authenticated");

      try {
        if (isCancelled) {
          return;
        }

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

    restoreSession();

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

  const createSessionResult = (response) => {
    const session = {
      id: response.data.user.id,
      name: response.data.user.name,
      token: response.data.token,
    };

    applyAuthToken(session.token);
    saveCurrentSession(session);
    setCurrentUser(session);
    setAuthStatus("authenticated");

    return { success: true };
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

      return createSessionResult(response);
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

      return createSessionResult(response);
    } catch (error) {
      const fallbackMessage = error?.request
        ? "Cannot reach the backend. Check your API URL and backend server."
        : "Unable to register right now.";

      return {
        error: error?.response?.data?.error || fallbackMessage,
      };
    }
  };

  const completedCount = todos.filter(
    (todo) => todo.completed || todo.status === "completed"
  ).length;
  const pendingCount = Math.max(todos.length - completedCount, 0);
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
            <div className="header">
              <div className="header-left">
                <p className="header-eyebrow">
                  Mindful productivity, tuned for your phone
                </p>
                <h1 className="title-with-icon">
                  <Icon name="clipboard" className="title-icon" />
                  <span>Todo Management System</span>
                </h1>
                <p className="subtitle">
                  Plan, review, and finish tasks inside a calmer workspace with
                  soft focus and clear priorities.
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

            <div className="tab-content">
              {activeTab === "checklist" && (
                <DailyChecklist onTasksChange={fetchTodos} />
              )}

              {activeTab === "weekly" && (
                <WeeklyView onTasksChange={fetchTodos} />
              )}

              {activeTab === "monthly" && (
                <MonthlyView onTasksChange={fetchTodos} />
              )}

              {activeTab === "tasks" && (
                <TaskManager onTasksChange={setTodos} />
              )}

              {activeTab === "dashboard" && <Dashboard />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
