import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";
import Icon from "./Icon";
import {
  formatLocalDate,
  getTaskStatusForDate,
  taskOccursOnDate,
} from "../utils/dateUtils";
import "../styles/WeeklyView.css";

const WeeklyView = ({ onTasksChange }) => {
  const [weeklyTasks, setWeeklyTasks] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
  });

  const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayShortLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchWeeklyTasks();
  }, [selectedWeek]);

  const fetchWeeklyTasks = async () => {
    try {
      setLoading(true);
      const startOfWeek = getStartOfWeek(selectedWeek);

      const response = await axios.get(
        `${API_BASE_URL}/weekly/${formatLocalDate(startOfWeek)}`
      );

      const organized = {};
      for (let i = 0; i < 7; i++) {
        organized[i] = [];
      }

      response.data.forEach((task) => {
        for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
          const dayDate = new Date(startOfWeek);
          dayDate.setDate(dayDate.getDate() + dayIndex);

          if (taskOccursOnDate(task, dayDate)) {
            organized[dayIndex].push({
              ...task,
              dayIndex,
            });
          }
        }
      });

      setWeeklyTasks(organized);
      calculateWeeklyStats(organized);
      setError(null);
    } catch (err) {
      console.error("Error fetching weekly tasks:", err);
      setError("Failed to load weekly tasks");
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyStats = (tasks) => {
    let totalTasks = 0;
    let completedTasks = 0;
    const startOfWeek = getStartOfWeek(selectedWeek);

    Object.entries(tasks).forEach(([dayIndex, dayTasks]) => {
      dayTasks.forEach((task) => {
        totalTasks++;
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(dayDate.getDate() + parseInt(dayIndex, 10));
        if (getTaskStatusForDate(task, dayDate) === "completed") {
          completedTasks++;
        }
      });
    });

    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    setWeeklyStats({ total: totalTasks, completed: completedTasks, percentage });
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    return d;
  };

  const handleToggleComplete = async (id, currentStatus, dayIndex) => {
    try {
      const dayDate = new Date(getStartOfWeek(selectedWeek));
      dayDate.setDate(dayDate.getDate() + dayIndex);
      const dateStr = formatLocalDate(dayDate);
      
      const endpoint = currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `${API_BASE_URL}/${id}/${endpoint}?date=${dateStr}`,
        {}
      );
      await fetchWeeklyTasks();
      if (onTasksChange) {
        await onTasksChange();
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const weekStart = getStartOfWeek(selectedWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const isCurrentWeek =
    getStartOfWeek(new Date()).getTime() === getStartOfWeek(selectedWeek).getTime();

  return (
    <div className="weekly-view">
      <div className="weekly-header">
        <h1 className="title-with-icon">
          <Icon name="calendarWeek" className="title-icon" />
          <span>Weekly Habit Tracker</span>
        </h1>
        <p className="weekly-subtitle">Track your daily habits throughout the week</p>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="btn-nav" onClick={goToPreviousWeek} title="Previous week">
          <span className="button-with-icon">
            <Icon name="chevronLeft" size={18} />
            <span>Previous Week</span>
          </span>
        </button>

        <div className="week-display">
          <h2>
            {weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          {isCurrentWeek && <span className="current-week-badge">Current Week</span>}
        </div>

        <button className="btn-nav" onClick={goToNextWeek} title="Next week">
          <span className="button-with-icon">
            <span>Next Week</span>
            <Icon name="chevronRight" size={18} />
          </span>
        </button>
      </div>

      {!isCurrentWeek && (
        <button className="btn-current-week" onClick={goToCurrentWeek}>
          <span className="button-with-icon">
            <Icon name="target" size={18} />
            <span>Go to Current Week</span>
          </span>
        </button>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Weekly Progress Stats */}
      <div className="weekly-progress">
        <div className="progress-card">
          <div className="progress-stat">
            <span className="stat-label">Weekly Progress</span>
            <span className="stat-value">{weeklyStats.percentage}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${weeklyStats.percentage}%` }}
            ></div>
          </div>
          <div className="progress-details">
            <span>
              {weeklyStats.completed} of {weeklyStats.total} completed
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading weekly tasks...</div>
      ) : (
        <div className="weekly-grid">
          {dayLabels.map((_, dayIndex) => {
            const dayTasks = weeklyTasks[dayIndex] || [];
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + dayIndex);
            const completedCount = dayTasks.filter(
              (task) => getTaskStatusForDate(task, dayDate) === "completed"
            ).length;

            return (
              <div key={dayIndex} className="day-card">
                <div className="day-header">
                  <div className="day-title">
                    <h3 className="day-name">{dayShortLabels[dayIndex]}</h3>
                    <p className="day-date">{dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <div className="day-progress">
                    <span className="progress-text">
                      {completedCount}/{dayTasks.length}
                    </span>
                  </div>
                </div>

                {dayTasks.length === 0 ? (
                  <div className="no-tasks-day">
                    <p>No tasks for this day</p>
                  </div>
                ) : (
                  <div className="day-tasks">
                    {dayTasks.map((task) => (
                      <div
                        key={`${task._id}-${dayIndex}`}
                        className={`task-item-day ${getTaskStatusForDate(task, dayDate) === "completed" ? "completed" : ""}`}
                      >
                        <div className="checkbox-wrapper-day">
                          <input
                            type="checkbox"
                            id={`task-day-${task._id}-${dayIndex}`}
                            checked={getTaskStatusForDate(task, dayDate) === "completed"}
                            onChange={() =>
                              handleToggleComplete(
                                task._id,
                                getTaskStatusForDate(task, dayDate),
                                dayIndex
                              )
                            }
                            className="task-checkbox-day"
                          />
                          <label
                            htmlFor={`task-day-${task._id}-${dayIndex}`}
                            className="checkbox-label-day"
                          >
                            {getTaskStatusForDate(task, dayDate) === "completed" && (
                              <Icon name="check" size={14} />
                            )}
                          </label>
                        </div>
                        <div className="task-content-day">
                          <p className="task-text-day">{task.text}</p>
                          <span className={`badge-day priority-${task.priority}`}>
                            {task.priority.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyView;
