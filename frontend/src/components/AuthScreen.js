import { useEffect, useState } from "react";
import Icon from "./Icon";
import "../styles/AuthScreen.css";

function AuthScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError("");
    setName("");
    setIsSubmitting(false);
  }, [mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const action = mode === "login" ? onLogin : onRegister;
      const result = await action(name);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setError("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-badge">
          <Icon name="sparkles" size={16} />
          <span>Simple access</span>
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Login to continue" : "Create your access"}
        </h1>
        <p className="auth-copy">
          {mode === "login"
            ? "Use your name to enter the workspace."
            : "Register once with your name, then use it to log in later."}
        </p>

        <div className="auth-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={`auth-switch-button ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-switch-button ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="auth-name">
            Your name
          </label>
          <div className="auth-input-wrap">
            <Icon name="user" size={18} className="auth-input-icon" />
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              placeholder="Enter your name"
              className="auth-input"
              autoComplete="name"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={mode === "login" ? "go" : "done"}
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            <span className="button-with-icon">
              <span>
                {isSubmitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login"
                    : "Register"}
              </span>
              <Icon name="chevronRight" size={18} />
            </span>
          </button>
        </form>

        <p className="auth-note">
          Only your name is required. This simple access flow is stored in this browser.
        </p>
      </div>
    </div>
  );
}

export default AuthScreen;
