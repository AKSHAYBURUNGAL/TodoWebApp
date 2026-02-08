import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TaskManager.css";

const TaskManager = ({ token, onTasksChange }) => {
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
    startDate: new Date().toISOString().split("T")[0],
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
      const response = await axios.get("http://localhost:5000/api/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
          `http://localhost:5000/api/todos/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/todos", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      startDate: task.startDate.split("T")[0],
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      endDate: task.endDate ? task.endDate.split("T")[0] : "",
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
      await axios.delete(`http://localhost:5000/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        `http://localhost:5000/api/todos/${id}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      startDate: new Date().toISOString().split("T")[0],
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
        <h1>📋 Task Manager</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="task-form" onSubmit={handleSubmit}>
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

          {formData.recurrence === "weekly" && (
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
                    {label}
                  </label>
                ))}
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
                    {task.status === "completed" ? "✓" : "○"}
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
                  className="btn btn-small btn-edit"
                  onClick={() => handleEdit(task)}
                  title="Edit task"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-small btn-delete"
                  onClick={() => handleDelete(task._id)}
                  title="Delete task"
                >
                  🗑️
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
