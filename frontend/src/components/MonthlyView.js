import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/MonthlyView.css";

const MonthlyView = ({ token }) => {
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
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const response = await axios.get(
        `http://localhost:5000/api/todos/monthly/${year}/${month + 1}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Organize tasks by day of month
      const organized = {};
      for (let i = 1; i <= lastDay.getDate(); i++) {
        organized[i] = [];
      }

      response.data.forEach((task) => {
        if (task.recurrence === "monthly") {
          // Add to the same day each month
          const day = new Date(task.startDate).getDate();
          if (day <= lastDay.getDate()) {
            organized[day].push({ ...task, dayOfMonth: day });
          }
        } else if (task.recurrence === "daily") {
          // Add daily tasks to every day of the month
          for (let i = 1; i <= lastDay.getDate(); i++) {
            organized[i].push({ ...task, dayOfMonth: i });
          }
        } else if (task.recurrence === "weekly" && task.recurrenceDays) {
          // Add weekly tasks to matching days
          for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            if (task.recurrenceDays.includes(dayOfWeek)) {
              organized[i].push({ ...task, dayOfMonth: i });
            }
          }
        } else if (task.recurrence === "none") {
          // Add one-time tasks on their due date
          const taskDate = new Date(task.dueDate || task.startDate);
          if (taskDate.getMonth() === month && taskDate.getFullYear() === year) {
            const day = taskDate.getDate();
            organized[day].push({ ...task, dayOfMonth: day });
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
      const dayOfMonth = parseInt(dayStr);
      const dateStr = new Date(year, month, dayOfMonth).toISOString().split("T")[0];

      dayTasks.forEach((task) => {
        totalTasks++;
        if (task.recurrence !== "none" && task.completionHistory && task.completionHistory.length > 0) {
          const isCompleted = task.completionHistory.some((record) => {
            return record.completedAt.split("T")[0] === dateStr;
          });
          if (isCompleted) completedTasks++;
        } else if (task.status === "completed") {
          completedTasks++;
        }
      });
    });

    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    setMonthlyStats({ total: totalTasks, completed: completedTasks, percentage });
  };

  const getTaskStatusForDate = (task, dayOfMonth) => {
    if (task.recurrence === "none") {
      return task.status;
    }

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const dateStr = new Date(year, month, dayOfMonth).toISOString().split("T")[0];

    if (task.completionHistory && task.completionHistory.length > 0) {
      const isCompleted = task.completionHistory.some((record) => {
        return record.completedAt.split("T")[0] === dateStr;
      });
      return isCompleted ? "completed" : "pending";
    }
    return "pending";
  };

  const handleToggleComplete = async (id, currentStatus, dayOfMonth) => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const dateStr = new Date(year, month, dayOfMonth).toISOString().split("T")[0];

      const endpoint = currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `http://localhost:5000/api/todos/${id}/${endpoint}?date=${dateStr}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchMonthlyTasks();
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
        <h1>📆 Monthly Habit Tracker</h1>
        <p className="monthly-subtitle">Track your daily habits throughout the month</p>
      </div>

      {/* Month Navigation */}
      <div className="month-navigation">
        <button className="btn-nav" onClick={goToPreviousMonth} title="Previous month">
          ← Previous Month
        </button>

        <div className="month-display">
          <h2>{monthName}</h2>
          {isCurrentMonth && <span className="current-month-badge">Current Month</span>}
        </div>

        <button className="btn-nav" onClick={goToNextMonth} title="Next month">
          Next Month →
        </button>
      </div>

      {!isCurrentMonth && (
        <button className="btn-current-month" onClick={goToCurrentMonth}>
          Go to Current Month
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
              const completedCount = dayTasks.filter((t) => getTaskStatusForDate(t, day) === "completed").length;
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
                      {dayTasks.slice(0, 3).map((task, idx) => (
                        <div
                          key={`${task._id}-${day}`}
                          className={`task-preview ${getTaskStatusForDate(task, day) === "completed" ? "completed" : ""}`}
                          title={task.text}
                        >
                          <input
                            type="checkbox"
                            id={`task-month-${task._id}-${day}`}
                            checked={getTaskStatusForDate(task, day) === "completed"}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(task._id, getTaskStatusForDate(task, day), day);
                            }}
                            className="task-checkbox-month"
                          />
                          <label
                            htmlFor={`task-month-${task._id}-${day}`}
                            className="task-label-month"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={`priority-dot priority-${task.priority}`}></span>
                            <span className="task-name">{task.text.substring(0, 12)}...</span>
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
