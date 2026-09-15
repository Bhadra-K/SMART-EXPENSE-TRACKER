import React from "react";

function Settings({ currentUser, onLogout }) {
  return (
    <div>
      <div className="topbar">
        <div>
          <p className="welcome">Application</p>
          <h1>Settings</h1>
        </div>
      </div>

      {/* PROFILE */}

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Profile</h3>
            <p>Your account information</p>
          </div>
        </div>

        <div className="overview-grid">
          <div className="overview-item">
            <span>Name</span>
            <strong>
              {currentUser?.name || "User"}
            </strong>
          </div>

          <div className="overview-item">
            <span>Email</span>
            <strong>
              {currentUser?.email || "-"}
            </strong>
          </div>

          <div className="overview-item">
            <span>Account Type</span>
            <strong>Personal Account</strong>
          </div>

          <div className="overview-item">
            <span>Status</span>
            <strong className="positive">
              Active
            </strong>
          </div>
        </div>
      </div>

      {/* ACCOUNT */}

      <div className="panel transactions-panel">
        <div className="panel-heading">
          <div>
            <h3>Account</h3>
            <p>Manage your Smart Expense Tracker account</p>
          </div>
        </div>

        <div className="overview-grid">
          <div className="overview-item">
            <span>Authentication</span>
            <strong>Password Protected</strong>
          </div>

          <div className="overview-item">
            <span>Session</span>
            <strong className="positive">
              Logged In
            </strong>
          </div>
        </div>
      </div>

      {/* ABOUT */}

      <div className="panel transactions-panel">
        <div className="panel-heading">
          <div>
            <h3>About Smart Expense Tracker</h3>

            <p>
              Track your money. Understand your spending.
              Plan smarter.
            </p>
          </div>
        </div>

        <div className="overview-grid">
          <div className="overview-item">
            <span>Application</span>
            <strong>Smart Expense Tracker</strong>
          </div>

          <div className="overview-item">
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>

          <div className="overview-item">
            <span>Technology</span>
            <strong>MERN Stack</strong>
          </div>

          <div className="overview-item">
            <span>Database</span>
            <strong>MongoDB Atlas</strong>
          </div>
        </div>
      </div>

      {/* LOGOUT */}

      <div className="panel transactions-panel">
        <div className="panel-heading">
          <div>
            <h3>Sign Out</h3>

            <p>
              Sign out of your Smart Expense Tracker
              account.
            </p>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            ↪ Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;