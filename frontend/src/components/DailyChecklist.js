import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/DailyChecklist.css";

const DailyChecklist = ({ token }) => {
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, percentage: 0 });

  useEffect(() => {
    fetchDailyTasks();
  }, [selectedDate]);

  const fetchDailyTasks = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await axios.get(
        `http://localhost:5000/api/todos/daily/${dateStr}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTodaysTasks(response.data);
      calculateStats(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching daily tasks:", err);
      setError("Failed to load today's tasks");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    setStats({ total, completed, percentage });
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const endpoint =
        currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `http://localhost:5000/api/todos/${id}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchDailyTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return (
    <div className="daily-checklist">
      <div className="checklist-header">
        <h1>📅 Daily Checklist</h1>
        <p className="checklist-subtitle">
          Complete your daily tasks and track your progress
        </p>
      </div>

      {/* Date Navigation */}
      <div className="date-navigation">
        <button className="btn-nav" onClick={goToPreviousDay} title="Previous day">
          ← Previous
        </button>

        <div className="date-display">
          <h2>{selectedDate.toLocaleDateString("en-US", dateOptions)}</h2>
          {isToday && <span className="today-badge">Today</span>}
        </div>

        <button className="btn-nav" onClick={goToNextDay} title="Next day">
          Next →
        </button>
      </div>

      {!isToday && (
        <button className="btn-today" onClick={goToToday}>
          Go to Today
        </button>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Progress Stats */}
      <div className="progress-section">
        <div className="progress-card">
          <div className="progress-stat">
            <span className="stat-label">Today's Progress</span>
            <span className="stat-value">{stats.percentage}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <div className="progress-details">
            <span>
              {stats.completed} of {stats.total} completed
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading tasks...</div>
      ) : todaysTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>No tasks for {isToday ? "today" : "this day"}</h3>
          <p>All caught up! Time to relax or plan ahead.</p>
        </div>
      ) : (
        <div className="checklist-container">
          {/* High Priority */}
          {todaysTasks.some((t) => t.priority === "high") && (
            <div className="task-group">
              <h3 className="group-title high-priority">
                🔴 High Priority ({todaysTasks.filter((t) => t.priority === "high").length})
              </h3>
              <div className="tasks-group-list">
                {todaysTasks
                  .filter((t) => t.priority === "high")
                  .map((task) => (
                    <TaskChecklistItem
                      key={task._id}
                      task={task}
                      onToggle={handleToggleComplete}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Medium Priority */}
          {todaysTasks.some((t) => t.priority === "medium") && (
            <div className="task-group">
              <h3 className="group-title medium-priority">
                🟡 Medium Priority (
                {todaysTasks.filter((t) => t.priority === "medium").length})
              </h3>
              <div className="tasks-group-list">
                {todaysTasks
                  .filter((t) => t.priority === "medium")
                  .map((task) => (
                    <TaskChecklistItem
                      key={task._id}
                      task={task}
                      onToggle={handleToggleComplete}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Low Priority */}
          {todaysTasks.some((t) => t.priority === "low") && (
            <div className="task-group">
              <h3 className="group-title low-priority">
                🟢 Low Priority ({todaysTasks.filter((t) => t.priority === "low").length})
              </h3>
              <div className="tasks-group-list">
                {todaysTasks
                  .filter((t) => t.priority === "low")
                  .map((task) => (
                    <TaskChecklistItem
                      key={task._id}
                      task={task}
                      onToggle={handleToggleComplete}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {todaysTasks.length > 0 && (
        <div className="checklist-summary">
          <div className="summary-item">
            <span className="summary-label">Total Tasks:</span>
            <span className="summary-value">{stats.total}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Completed:</span>
            <span className="summary-value completed">{stats.completed}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Remaining:</span>
            <span className="summary-value pending">
              {stats.total - stats.completed}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Task Item Component
const TaskChecklistItem = ({ task, onToggle }) => {
  const isCompleted = task.status === "completed";

  return (
    <div className={`checklist-item ${isCompleted ? "completed" : ""}`}>
      <label className="checkbox-wrapper">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(task._id, task.status)}
          className="task-checkbox"
        />
        <span className="checkmark"></span>
      </label>

      <div className="task-details">
        <h4 className="task-title">{task.text}</h4>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        {task.dueDate && (
          <p className="task-due-time">
            Due: {new Date(task.dueDate).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {task.category && (
          <span className="task-category">{task.category}</span>
        )}
      </div>

      {isCompleted && <div className="completed-badge">✓ Done</div>}
    </div>
  );
};

export default DailyChecklist;
