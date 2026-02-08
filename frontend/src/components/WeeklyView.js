import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/WeeklyView.css";

const WeeklyView = ({ token }) => {
  const [weeklyTasks, setWeeklyTasks] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'
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
  }, [selectedWeek, viewMode]);

  const fetchWeeklyTasks = async () => {
    try {
      setLoading(true);
      const startOfWeek = getStartOfWeek(selectedWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const response = await axios.get(
        `http://localhost:5000/api/todos/weekly/${startOfWeek.toISOString().split("T")[0]}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Organize tasks by day of week
      const organized = {};
      for (let i = 0; i < 7; i++) {
        organized[i] = [];
      }

      response.data.forEach((task) => {
        // For recurring tasks, add them to the appropriate days
        if (task.recurrence === "weekly" && task.recurrenceDays) {
          task.recurrenceDays.forEach((dayIndex) => {
            organized[dayIndex].push({
              ...task,
              dayIndex,
            });
          });
        } else if (task.recurrence === "daily") {
          // Add daily tasks to every day
          for (let i = 0; i < 7; i++) {
            organized[i].push({
              ...task,
              dayIndex: i,
            });
          }
        } else {
          // For non-recurring tasks, add to their specific date
          const taskDate = new Date(task.startDate);
          const dayOfWeek = taskDate.getDay();
          if (dayOfWeek >= 0 && dayOfWeek <= 6) {
            organized[dayOfWeek].push({
              ...task,
              dayIndex: dayOfWeek,
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
        dayDate.setDate(dayDate.getDate() + parseInt(dayIndex));
        const dateStr = dayDate.toISOString().split("T")[0];

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
    setWeeklyStats({ total: totalTasks, completed: completedTasks, percentage });
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getTaskStatusForDate = (task, dayIndex) => {
    if (task.recurrence === "none") {
      return task.status;
    }
    
    const dayDate = new Date(getStartOfWeek(selectedWeek));
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const dateStr = dayDate.toISOString().split("T")[0];
    
    if (task.completionHistory && task.completionHistory.length > 0) {
      const isCompleted = task.completionHistory.some((record) => {
        return record.completedAt.split("T")[0] === dateStr;
      });
      return isCompleted ? "completed" : "pending";
    }
    return "pending";
  };

  const handleToggleComplete = async (id, currentStatus, dayIndex) => {
    try {
      const dayDate = new Date(getStartOfWeek(selectedWeek));
      dayDate.setDate(dayDate.getDate() + dayIndex);
      const dateStr = dayDate.toISOString().split("T")[0];
      
      const endpoint = currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `http://localhost:5000/api/todos/${id}/${endpoint}?date=${dateStr}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchWeeklyTasks();
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
        <h1>📆 Weekly Habit Tracker</h1>
        <p className="weekly-subtitle">Track your daily habits throughout the week</p>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button className="btn-nav" onClick={goToPreviousWeek} title="Previous week">
          ← Previous Week
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
          Next Week →
        </button>
      </div>

      {!isCurrentWeek && (
        <button className="btn-current-week" onClick={goToCurrentWeek}>
          Go to Current Week
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
          {dayLabels.map((dayLabel, dayIndex) => {
            const dayTasks = weeklyTasks[dayIndex] || [];
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + dayIndex);
            const completedCount = dayTasks.filter((t) => getTaskStatusForDate(t, dayIndex) === "completed").length;

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
                        className={`task-item-day ${getTaskStatusForDate(task, dayIndex) === "completed" ? "completed" : ""}`}
                      >
                        <div className="checkbox-wrapper-day">
                          <input
                            type="checkbox"
                            id={`task-day-${task._id}-${dayIndex}`}
                            checked={getTaskStatusForDate(task, dayIndex) === "completed"}
                            onChange={() => handleToggleComplete(task._id, getTaskStatusForDate(task, dayIndex), dayIndex)}
                            className="task-checkbox-day"
                          />
                          <label
                            htmlFor={`task-day-${task._id}-${dayIndex}`}
                            className="checkbox-label-day"
                          >
                            {getTaskStatusForDate(task, dayIndex) === "completed" ? "✓" : ""}
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
