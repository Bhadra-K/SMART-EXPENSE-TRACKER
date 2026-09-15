const API_URL = import.meta.env.VITE_API_URL || "";
import { useState } from "react";
import "./Auth.css";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      (!isLogin && !form.name) ||
      !form.email ||
      !form.password
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const endpoint = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Authentication failed."
        );
      }

      localStorage.setItem("expenseToken", data.token);

      localStorage.setItem(
        "expenseUser",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (error) {
      console.error("Authentication error:", error);

      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>
      </div>

      <div className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-brand">
          <div className="auth-logo">
            ₹
          </div>

          <h1>
            Smart Expense
            <span>Tracker</span>
          </h1>

          <p className="auth-tagline">
            Track your money.
            <br />
            Understand your spending.
            <br />
            Plan smarter.
          </p>

          <div className="auth-brand-bottom">
            <span>Personal Finance Management</span>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="auth-card">

          <div className="auth-header">

            <h2>
              {isLogin
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Sign in to continue managing your finances."
                : "Start taking control of your money today."}
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {!isLogin && (
              <div className="auth-field">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete={
                  isLogin
                    ? "current-password"
                    : "new-password"
                }
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
            >
              {isLogin
                ? "Sign In"
                : "Create Account"}

              <span>→</span>
            </button>
          </form>

          <div className="auth-divider">
            <span></span>
            <p>
              {isLogin
                ? "New to Smart Expense?"
                : "Already have an account?"}
            </p>
            <span></span>
          </div>

          <button
            type="button"
            className="auth-switch"
            onClick={() =>
              setIsLogin((current) => !current)
            }
          >
            {isLogin
              ? "Create an account"
              : "Sign in instead"}
          </button>

          <p className="auth-footer">
            Your financial data, organized simply.
          </p>

        </div>
      </div>
    </div>
  );
}

export default Auth;