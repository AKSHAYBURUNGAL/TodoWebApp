import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";
import Icon from "./Icon";
import {
  formatLocalDate,
  getTaskStatusForDate,
  taskOccursOnDate,
} from "../utils/dateUtils";
import "../styles/MonthlyView.css";

const MonthlyView = ({ onTasksChange }) => {
  const [monthlyTasks, setMonthlyTasks] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
  });

  useEffect(() => {
    fetchMonthlyTasks();
  }, [selectedMonth]);

  const fetchMonthlyTasks = async () => {
    try {
      setLoading(true);
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const lastDay = new Date(year, month + 1, 0);

      const response = await axios.get(
        `${API_BASE_URL}/monthly/${year}/${month + 1}`
      );

      const organized = {};
      for (let i = 1; i <= lastDay.getDate(); i++) {
        organized[i] = [];
      }

      response.data.forEach((task) => {
        for (let dayOfMonth = 1; dayOfMonth <= lastDay.getDate(); dayOfMonth += 1) {
          const dayDate = new Date(year, month, dayOfMonth, 12, 0, 0, 0);

          if (taskOccursOnDate(task, dayDate)) {
            organized[dayOfMonth].push({ ...task, dayOfMonth });
          }
        }
      });

      setMonthlyTasks(organized);
      calculateMonthlyStats(organized);
      setError(null);
    } catch (err) {
      console.error("Error fetching monthly tasks:", err);
      setError("Failed to load monthly tasks");
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (tasks) => {
    let totalTasks = 0;
    let completedTasks = 0;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    Object.entries(tasks).forEach(([dayStr, dayTasks]) => {
      const dayOfMonth = parseInt(dayStr, 10);
      const dayDate = new Date(year, month, dayOfMonth, 12, 0, 0, 0);

      dayTasks.forEach((task) => {
        totalTasks++;
        if (getTaskStatusForDate(task, dayDate) === "completed") {
          completedTasks++;
        }
      });
    });

    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    setMonthlyStats({ total: totalTasks, completed: completedTasks, percentage });
  };

  const handleToggleComplete = async (id, currentStatus, dayOfMonth) => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const dateStr = formatLocalDate(
        new Date(year, month, dayOfMonth, 12, 0, 0, 0)
      );

      const endpoint = currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `${API_BASE_URL}/${id}/${endpoint}?date=${dateStr}`,
        {}
      );
      await fetchMonthlyTasks();
      if (onTasksChange) {
        await onTasksChange();
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const isCurrentMonth =
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();

  const monthName = selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="monthly-view">
      <div className="monthly-header">
        <h1 className="title-with-icon">
          <Icon name="calendarMonth" className="title-icon" />
          <span>Monthly Habit Tracker</span>
        </h1>
        <p className="monthly-subtitle">Track your daily habits throughout the month</p>
      </div>

      {/* Month Navigation */}
      <div className="month-navigation">
        <button className="btn-nav" onClick={goToPreviousMonth} title="Previous month">
          <span className="button-with-icon">
            <Icon name="chevronLeft" size={18} />
            <span>Previous Month</span>
          </span>
        </button>

        <div className="month-display">
          <h2>{monthName}</h2>
          {isCurrentMonth && <span className="current-month-badge">Current Month</span>}
        </div>

        <button className="btn-nav" onClick={goToNextMonth} title="Next month">
          <span className="button-with-icon">
            <span>Next Month</span>
            <Icon name="chevronRight" size={18} />
          </span>
        </button>
      </div>

      {!isCurrentMonth && (
        <button className="btn-current-month" onClick={goToCurrentMonth}>
          <span className="button-with-icon">
            <Icon name="target" size={18} />
            <span>Go to Current Month</span>
          </span>
        </button>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Monthly Progress Stats */}
      <div className="monthly-progress">
        <div className="progress-card">
          <div className="progress-stat">
            <span className="stat-label">Monthly Progress</span>
            <span className="stat-value">{monthlyStats.percentage}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${monthlyStats.percentage}%` }}
            ></div>
          </div>
          <div className="progress-details">
            <span>
              {monthlyStats.completed} of {monthlyStats.total} completed
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading monthly tasks...</div>
      ) : (
        <div className="calendar-container">
          {/* Calendar Header */}
          <div className="calendar-weekdays">
            {dayLabels.map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Empty cells for days before month starts */}
            {Array(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay())
              .fill(0)
              .map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty"></div>
              ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayTasks = monthlyTasks[day] || [];
              const dayDate = new Date(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth(),
                day,
                12,
                0,
                0,
                0
              );
              const completedCount = dayTasks.filter(
                (task) => getTaskStatusForDate(task, dayDate) === "completed"
              ).length;
              const isToday =
                day === new Date().getDate() &&
                selectedMonth.getMonth() === new Date().getMonth() &&
                selectedMonth.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`calendar-day ${dayTasks.length > 0 ? "has-tasks" : ""} ${isToday ? "today" : ""}`}
                >
                  <div className="day-number">{day}</div>

                  {dayTasks.length > 0 && (
                    <div className="day-completion">
                      <span className="completion-badge">
                        {completedCount}/{dayTasks.length}
                      </span>
                    </div>
                  )}

                  {dayTasks.length > 0 && (
                    <div className="day-task-preview">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={`${task._id}-${day}`}
                          className={`task-preview ${getTaskStatusForDate(task, dayDate) === "completed" ? "completed" : ""}`}
                          title={task.text}
                        >
                          <input
                            type="checkbox"
                            id={`task-month-${task._id}-${day}`}
                            checked={getTaskStatusForDate(task, dayDate) === "completed"}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(
                                task._id,
                                getTaskStatusForDate(task, dayDate),
                                day
                              );
                            }}
                            className="task-checkbox-month"
                          />
                          <label
                            htmlFor={`task-month-${task._id}-${day}`}
                            className="task-label-month"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={`priority-dot priority-${task.priority}`}></span>
                            <span className="task-name">
                              {task.text.length > 12
                                ? `${task.text.substring(0, 12)}...`
                                : task.text}
                            </span>
                          </label>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="more-tasks">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;
