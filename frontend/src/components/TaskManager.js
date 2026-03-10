import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/apiConfig";
import Icon from "./Icon";
import { formatLocalDate, getDateInputValue } from "../utils/dateUtils";
import "../styles/TaskManager.css";

const TaskManager = ({ onTasksChange }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRecurrence, setFilterRecurrence] = useState("all");

  const [formData, setFormData] = useState({
    text: "",
    description: "",
    priority: "medium",
    startDate: formatLocalDate(new Date()),
    dueDate: "",
    endDate: "",
    category: "general",
    recurrence: "none",
    recurrenceDays: [],
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filterPriority, filterStatus, filterRecurrence]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setTasks(response.data);
      setError(null);
      if (onTasksChange) onTasksChange(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    if (filterRecurrence !== "all") {
      filtered = filtered.filter((task) => task.recurrence === filterRecurrence);
    }

    setFilteredTasks(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const days = prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter((d) => d !== day)
        : [...prev.recurrenceDays, day];
      return { ...prev, recurrenceDays: days };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/${editingId}`,
          formData
        );
      } else {
        await axios.post(API_BASE_URL, formData);
      }

      await fetchTasks();
      resetForm();
      setError(null);
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      text: task.text,
      description: task.description,
      priority: task.priority,
      startDate: getDateInputValue(task.startDate),
      dueDate: getDateInputValue(task.dueDate),
      endDate: getDateInputValue(task.endDate),
      category: task.category,
      recurrence: task.recurrence,
      recurrenceDays: task.recurrenceDays || [],
    });
    setEditingId(task._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      await fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const endpoint =
        currentStatus === "completed" ? "uncomplete" : "complete";
      await axios.patch(
        `${API_BASE_URL}/${id}/${endpoint}`,
        {}
      );
      await fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  const resetForm = () => {
    setFormData({
      text: "",
      description: "",
      priority: "medium",
      startDate: formatLocalDate(new Date()),
      dueDate: "",
      endDate: "",
      category: "general",
      recurrence: "none",
      recurrenceDays: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h1 className="title-with-icon">
          <Icon name="clipboard" className="title-icon" />
          <span>Task Manager</span>
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          <span className="button-with-icon">
            {!showForm && <Icon name="plus" size={18} />}
            <span>{showForm ? "Cancel" : "New Task"}</span>
          </span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="task-form-hero">
            <div>
              <p className="task-form-eyebrow">
                {editingId ? "Refine your focus" : "Mindful task creation"}
              </p>
              <h2 className="task-form-title">
                {editingId ? "Update your task" : "Create a clear next action"}
              </h2>
              <p className="task-form-copy">
                Keep it simple, choose the right rhythm, and let the task fit naturally into your day.
              </p>
            </div>

            <div className="task-form-chip">
              <Icon name={editingId ? "edit" : "plus"} size={16} />
              <span>{editingId ? "Editing mode" : "New task"}</span>
            </div>
          </div>

          <div className="task-form-panel">
            <div className="task-form-panel-header">
              <span className="task-form-panel-icon">
                <Icon name="clipboard" size={16} />
              </span>
              <div>
                <h3>Task details</h3>
                <p>Write one focused task with enough context to act on it later.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="text">Task Title *</label>
              <input
                type="text"
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description (optional)"
                rows="3"
              />
            </div>
          </div>

          <div className="task-form-panel">
            <div className="task-form-panel-header">
              <span className="task-form-panel-icon">
                <Icon name="flag" size={16} />
              </span>
              <div>
                <h3>Planning</h3>
                <p>Set the importance, category, and repeat pattern in one place.</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="recurrence">Recurrence</label>
                <select
                  id="recurrence"
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleInputChange}
                >
                  <option value="none">No Recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Work, Personal"
                />
              </div>
            </div>
          </div>

          <div className="task-form-panel">
            <div className="task-form-panel-header">
              <span className="task-form-panel-icon">
                <Icon name="calendarDay" size={16} />
              </span>
              <div>
                <h3>Schedule</h3>
                <p>Choose when the task starts, when it is due, and when it should stop repeating.</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date (for recurring tasks)</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {formData.recurrence === "weekly" && (
            <div className="task-form-panel">
              <div className="task-form-panel-header">
                <span className="task-form-panel-icon">
                  <Icon name="calendarWeek" size={16} />
                </span>
                <div>
                  <h3>Weekly rhythm</h3>
                  <p>Select the days when this habit or recurring task should appear.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Repeat on Days:</label>
                <div className="days-selector">
                  {dayLabels.map((label, index) => (
                    <label key={index} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.recurrenceDays.includes(index)}
                        onChange={() => handleDayToggle(index)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Task" : "Create Task"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="task-filters">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterRecurrence}
          onChange={(e) => setFilterRecurrence(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Recurrence</option>
          <option value="none">No Recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {loading && !showForm ? (
        <div className="loading">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.status === "completed" ? "completed" : ""}`}
            >
              <div className="task-content">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id={`task-${task._id}`}
                    checked={task.status === "completed"}
                    onChange={() => handleToggleComplete(task._id, task.status)}
                    className="task-checkbox"
                  />
                  <label htmlFor={`task-${task._id}`} className="checkbox-label">
                    <Icon
                      name={task.status === "completed" ? "check" : "circle"}
                      size={18}
                    />
                  </label>
                </div>
                <div className="task-info">
                  <h3 className="task-title">{task.text}</h3>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <span className={`badge priority-${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="badge recurrence">
                      {task.recurrence.charAt(0).toUpperCase() +
                        task.recurrence.slice(1)}
                    </span>
                    {task.dueDate && (
                      <span className="badge due-date">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="task-actions">
                <button
                  className="btn btn-small btn-edit icon-button"
                  onClick={() => handleEdit(task)}
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <Icon name="edit" size={18} />
                </button>
                <button
                  className="btn btn-small btn-delete icon-button"
                  onClick={() => handleDelete(task._id)}
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
