import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";
import Icon from "./Icon";
import { formatLocalDate, getTaskStatusForDate } from "../utils/dateUtils";
import "../styles/DailyChecklist.css";

const DailyChecklist = ({ onTasksChange }) => {
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
      const dateStr = formatLocalDate(selectedDate);
      const response = await axios.get(
        `${API_BASE_URL}/daily/${dateStr}`
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
    const completed = tasks.filter(
      (task) => getTaskStatusForDate(task, selectedDate) === "completed"
    ).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    setStats({ total, completed, percentage });
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const dateStr = formatLocalDate(selectedDate);
      const endpoint =
        currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `${API_BASE_URL}/${id}/${endpoint}?date=${dateStr}`,
        {}
      );
      await fetchDailyTasks();
      if (onTasksChange) {
        await onTasksChange();
      }
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
        <h1 className="title-with-icon">
          <Icon name="calendarDay" className="title-icon" />
          <span>Daily Checklist</span>
        </h1>
        <p className="checklist-subtitle">
          Complete your daily tasks and track your progress
        </p>
      </div>

      {/* Date Navigation */}
      <div className="date-navigation">
        <button className="btn-nav" onClick={goToPreviousDay} title="Previous day">
          <span className="button-with-icon">
            <Icon name="chevronLeft" size={18} />
            <span>Previous</span>
          </span>
        </button>

        <div className="date-display">
          <h2>{selectedDate.toLocaleDateString("en-US", dateOptions)}</h2>
          {isToday && <span className="today-badge">Today</span>}
        </div>

        <button className="btn-nav" onClick={goToNextDay} title="Next day">
          <span className="button-with-icon">
            <span>Next</span>
            <Icon name="chevronRight" size={18} />
          </span>
        </button>
      </div>

      {!isToday && (
        <button className="btn-today" onClick={goToToday}>
          <span className="button-with-icon">
            <Icon name="target" size={18} />
            <span>Go to Today</span>
          </span>
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
          <div className="empty-icon empty-icon-badge">
            <Icon name="sparkles" size={32} />
          </div>
          <h3>No tasks for {isToday ? "today" : "this day"}</h3>
          <p>All caught up! Time to relax or plan ahead.</p>
        </div>
      ) : (
        <div className="checklist-container">
          {/* High Priority */}
          {todaysTasks.some((t) => t.priority === "high") && (
            <div className="task-group">
              <h3 className="group-title high-priority">
                <span className="group-title-content">
                  <Icon name="flag" size={16} />
                  <span>High Priority ({todaysTasks.filter((t) => t.priority === "high").length})</span>
                </span>
              </h3>
              <div className="tasks-group-list">
                {todaysTasks
                  .filter((t) => t.priority === "high")
                  .map((task) => (
                    <TaskChecklistItem
                      key={task._id}
                      task={task}
                      selectedDate={selectedDate}
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
                <span className="group-title-content">
                  <Icon name="flag" size={16} />
                  <span>Medium Priority ({todaysTasks.filter((t) => t.priority === "medium").length})</span>
                </span>
              </h3>
              <div className="tasks-group-list">
                {todaysTasks
                  .filter((t) => t.priority === "medium")
                  .map((task) => (
                    <TaskChecklistItem
                      key={task._id}
                      task={task}
                      selectedDate={selectedDate}
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
                <span className="group-title-content">
                  <Icon name="flag" size={16} />
                  <span>Low Priority ({todaysTasks.filter((t) => t.priority === "low").length})</span>
                </span>
              </h3>
              <div className="tasks-group-list">
                {todaysTasks
                  .filter((t) => t.priority === "low")
                  .map((task) => (
                    <TaskChecklistItem
                      key={task._id}
                      task={task}
                      selectedDate={selectedDate}
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
const TaskChecklistItem = ({ task, selectedDate, onToggle }) => {
  const taskStatus = getTaskStatusForDate(task, selectedDate);
  const isCompleted = taskStatus === "completed";

  return (
    <div className={`checklist-item ${isCompleted ? "completed" : ""}`}>
      <label className="checkbox-wrapper">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(task._id, taskStatus)}
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
            <Icon name="clock" size={14} className="meta-icon" />
            <span>
              Due:{" "}
              {new Date(task.dueDate).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        )}
        {task.category && (
          <span className="task-category">{task.category}</span>
        )}
      </div>

      {isCompleted && (
        <div className="completed-badge">
          <Icon name="check" size={14} />
          <span>Done</span>
        </div>
      )}
    </div>
  );
};

export default DailyChecklist;
