const API_URL = import.meta.env.VITE_API_URL || "";
import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";

function App() {
  /* =========================
     AUTHENTICATION
  ========================= */

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("expenseUser");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to read saved user:", error);
      localStorage.removeItem("expenseUser");
      return null;
    }
  });

  const [activePage, setActivePage] = useState("dashboard");

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActivePage("dashboard");
    setShowNotifications(false);
    setReadNotifications([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("expenseToken");
    localStorage.removeItem("expenseUser");

    setCurrentUser(null);
    setActivePage("dashboard");
    setShowNotifications(false);
    setReadNotifications([]);
  };

  /* =========================
     MAIN STATE
  ========================= */

  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);

  /* =========================
     NOTIFICATION STATE
  ========================= */

  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);

  /* =========================
     BUDGET FORM
  ========================= */

  const [budgetForm, setBudgetForm] = useState({
    category: "Food",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    alertThreshold: 80,
  });

  /* =========================
     TRANSACTION MENU
  ========================= */

  const [showTransactionMenu, setShowTransactionMenu] = useState(false);

  /* =========================
     EXPENSE FORM
  ========================= */

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    date: "",
    category: "Food",
    paymentMethod: "Cash",
    notes: "",
  });

  /* =========================
     INCOME FORM
  ========================= */

  const [incomeForm, setIncomeForm] = useState({
    source: "",
    amount: "",
    date: "",
    description: "",
  });

  /* =========================
     FETCH EXPENSES
  ========================= */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    fetch(`${API_URL}/api/expenses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }

        return response.json();
      })
      .then((data) => {
        setExpenses(data);
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
      });
  }, [currentUser]);

  /* =========================
     FETCH INCOME
  ========================= */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    fetch(`${API_URL}/api/income`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch income");
        }

        return response.json();
      })
      .then((data) => {
        setIncome(data);
      })
      .catch((error) => {
        console.error("Error fetching income:", error);
      });
  }, [currentUser]);

  /* =========================
     FETCH BUDGETS
  ========================= */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    fetch(`${API_URL}/api/budgets`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch budgets");
        }

        return response.json();
      })
      .then((data) => {
        setBudgets(data);
      })
      .catch((error) => {
        console.error("Error fetching budgets:", error);
      });
  }, [currentUser]);

  /* =========================
     EXPENSE FORM
  ========================= */

  const handleExpenseInputChange = (event) => {
    const { name, value } = event.target;

    setExpenseForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================
     ADD EXPENSE
  ========================= */

  const handleAddExpense = async (event) => {
    event.preventDefault();

    if (
      !expenseForm.name ||
      !expenseForm.amount ||
      !expenseForm.date ||
      !expenseForm.category ||
      !expenseForm.paymentMethod
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const newExpense = {
      name: expenseForm.name,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      category: expenseForm.category,
      paymentMethod: expenseForm.paymentMethod,
      notes: expenseForm.notes,
    };

    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense");
      }

      const savedExpense = await response.json();

      setExpenses((currentExpenses) => [
        savedExpense,
        ...currentExpenses,
      ]);

      setExpenseForm({
        name: "",
        amount: "",
        date: "",
        category: "Food",
        paymentMethod: "Cash",
        notes: "",
      });

      alert("Expense added successfully!");

      setActivePage("transactions");
    } catch (error) {
      console.error("Error adding expense:", error);

      alert(
        "Failed to save expense. Please make sure the backend is running."
      );
    }
  };

  /* =========================
     DELETE EXPENSE
  ========================= */

  const handleDeleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      setExpenses((currentExpenses) =>
        currentExpenses.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting expense:", error);

      alert(
        "Failed to delete expense. Please make sure the backend is running."
      );
    }
  };

  /* =========================
     BUDGET FORM
  ========================= */

  const handleBudgetInputChange = (event) => {
    const { name, value } = event.target;

    setBudgetForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================
     ADD BUDGET
  ========================= */

  const handleAddBudget = async (event) => {
    event.preventDefault();

    if (!budgetForm.category || !budgetForm.amount) {
      alert("Please fill in all required fields.");
      return;
    }

    const newBudget = {
      category: budgetForm.category,
      amount: Number(budgetForm.amount),
      month: Number(budgetForm.month),
      year: Number(budgetForm.year),
      alertThreshold: Number(budgetForm.alertThreshold || 80),
    };

    try {
      const response = await fetch(`${API_URL}/api/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
        },
        body: JSON.stringify(newBudget),
      });

      if (!response.ok) {
        throw new Error("Failed to save budget");
      }

      const savedBudget = await response.json();

      setBudgets((currentBudgets) => [
        savedBudget,
        ...currentBudgets,
      ]);

      setBudgetForm({
        category: "Food",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        alertThreshold: 80,
      });

      alert("Budget added successfully!");
    } catch (error) {
      console.error("Error adding budget:", error);

      alert(
        "Failed to save budget. Please make sure the backend is running."
      );
    }
  };

  /* =========================
     DELETE BUDGET
  ========================= */

  const handleDeleteBudget = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/budgets/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      setBudgets((currentBudgets) =>
        currentBudgets.filter((budget) => budget._id !== id)
      );
    } catch (error) {
      console.error("Error deleting budget:", error);

      alert(
        "Failed to delete budget. Please make sure the backend is running."
      );
    }
  };

  /* =========================
     INCOME FORM
  ========================= */

  const handleIncomeInputChange = (event) => {
    const { name, value } = event.target;

    setIncomeForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================
     ADD INCOME
  ========================= */

  const handleAddIncome = async (event) => {
    event.preventDefault();

    if (
      !incomeForm.source ||
      !incomeForm.amount ||
      !incomeForm.date
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const newIncome = {
      source: incomeForm.source,
      amount: Number(incomeForm.amount),
      date: incomeForm.date,
      description: incomeForm.description,
    };

    try {
      const response = await fetch(`${API_URL}/api/income`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
        },
        body: JSON.stringify(newIncome),
      });

      if (!response.ok) {
        throw new Error("Failed to save income");
      }

      const savedIncome = await response.json();

      setIncome((currentIncome) => [
        savedIncome,
        ...currentIncome,
      ]);

      setIncomeForm({
        source: "",
        amount: "",
        date: "",
        description: "",
      });

      alert("Income added successfully!");
    } catch (error) {
      console.error("Error adding income:", error);

      alert(
        "Failed to save income. Please make sure the backend is running."
      );
    }
  };

  /* =========================
     DELETE INCOME
  ========================= */

  const handleDeleteIncome = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this income?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/income/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("expenseToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete income");
      }

      setIncome((currentIncome) =>
        currentIncome.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting income:", error);

      alert(
        "Failed to delete income. Please make sure the backend is running."
      );
    }
  };

  /* =========================
     CALCULATIONS
  ========================= */

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const totalIncome = income.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const balance = totalIncome - totalExpenses;

  /* =========================
     CURRENT MONTH ANALYTICS
  ========================= */

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getMonth() + 1 === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = income.filter((item) => {
    const incomeDate = new Date(item.date);

    return (
      incomeDate.getMonth() + 1 === currentMonth &&
      incomeDate.getFullYear() === currentYear
    );
  });

  const monthlySpending = monthlyExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const monthlyIncomeTotal = monthlyIncome.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const currentMonthBudgets = budgets.filter(
    (budget) =>
      Number(budget.month) === currentMonth &&
      Number(budget.year) === currentYear
  );

  const totalMonthlyBudget = currentMonthBudgets.reduce(
    (total, budget) =>
      total + Number(budget.amount || 0),
    0
  );

  const budgetUsagePercentage =
    totalMonthlyBudget > 0
      ? (monthlySpending / totalMonthlyBudget) * 100
      : 0;

  const budgetProgress = Math.min(
    budgetUsagePercentage,
    100
  );

  const budgetRemaining =
    totalMonthlyBudget - monthlySpending;

  const incomeExpenseTotal =
    monthlyIncomeTotal + monthlySpending;

  const incomeComparisonPercentage =
    incomeExpenseTotal > 0
      ? (monthlyIncomeTotal / incomeExpenseTotal) * 100
      : 50;

  const expenseComparisonPercentage =
    incomeExpenseTotal > 0
      ? (monthlySpending / incomeExpenseTotal) * 100
      : 50;

  /* =========================
     CATEGORY EXPENSE ANALYTICS
  ========================= */

  const categoryTotals = expenses.reduce(
    (categories, expense) => {
      const category = expense.category || "Other";
      const amount = Number(expense.amount || 0);

      categories[category] =
        (categories[category] || 0) + amount;

      return categories;
    },
    {}
  );

  const categoryAnalytics = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpenses > 0
          ? (amount / totalExpenses) * 100
          : 0,
    }));

  /* =========================
     ADVANCED ANALYTICS
  ========================= */

  const lastSixMonths = Array.from(
    { length: 6 },
    (_, index) => {
      const monthDate = new Date(
        currentYear,
        currentMonth - 1 - (5 - index),
        1
      );

      const month = monthDate.getMonth() + 1;
      const year = monthDate.getFullYear();

      const monthExpenses = expenses.filter((expense) => {
        const date = new Date(expense.date);

        return (
          date.getMonth() + 1 === month &&
          date.getFullYear() === year
        );
      });

      const monthIncome = income.filter((item) => {
        const date = new Date(item.date);

        return (
          date.getMonth() + 1 === month &&
          date.getFullYear() === year
        );
      });

      const expenseTotal = monthExpenses.reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0
      );

      const incomeTotal = monthIncome.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

      return {
        month,
        year,
        label: monthDate.toLocaleDateString("en-IN", {
          month: "short",
        }),
        fullLabel: monthDate.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }),
        expenses: expenseTotal,
        income: incomeTotal,
        balance: incomeTotal - expenseTotal,
      };
    }
  );

  const maxSixMonthValue = Math.max(
    ...lastSixMonths.flatMap((item) => [
      item.expenses,
      item.income,
    ]),
    1
  );

  const previousMonthDate = new Date(
    currentYear,
    currentMonth - 2,
    1
  );

  const previousMonth = previousMonthDate.getMonth() + 1;
  const previousYear = previousMonthDate.getFullYear();

  const previousMonthExpenses = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        date.getMonth() + 1 === previousMonth &&
        date.getFullYear() === previousYear
      );
    })
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  const spendingChange =
    previousMonthExpenses > 0
      ? ((monthlySpending - previousMonthExpenses) /
          previousMonthExpenses) *
        100
      : null;

  const topCategory =
    categoryAnalytics.length > 0
      ? categoryAnalytics[0]
      : null;

  const averageMonthlySpending =
    lastSixMonths.reduce(
      (total, item) => total + item.expenses,
      0
    ) / 6;

  const categoryColors = [
    "#70a83b",
    "#4f8a58",
    "#285943",
    "#8cad70",
    "#a7c48c",
    "#c0d3ae",
    "#d4dfc7",
    "#607f5d",
    "#78966e",
    "#9bb28d",
  ];

  let donutStart = 0;

  const donutSegments = categoryAnalytics
    .slice(0, 8)
    .map((item, index) => {
      const start = donutStart;

      donutStart += item.percentage;

      return {
        ...item,
        color:
          categoryColors[
            index % categoryColors.length
          ],
        start,
        end: donutStart,
      };
    });

  const remainingCategoryPercentage =
    categoryAnalytics
      .slice(8)
      .reduce(
        (total, item) => total + item.percentage,
        0
      );

  if (remainingCategoryPercentage > 0) {
    donutSegments.push({
      category: "Other categories",
      amount: categoryAnalytics
        .slice(8)
        .reduce(
          (total, item) => total + item.amount,
          0
        ),
      percentage: remainingCategoryPercentage,
      color: "#b8c7b0",
      start: donutStart,
      end: donutStart + remainingCategoryPercentage,
    });
  }

  const donutBackground =
    donutSegments.length > 0
      ? `conic-gradient(${donutSegments
          .map(
            (item) =>
              `${item.color} ${item.start}% ${item.end}%`
          )
          .join(", ")})`
      : "#edf0ed";

  /* =========================
     FORMAT CURRENCY
  ========================= */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  /* =========================
     NOTIFICATIONS
  ========================= */

  const notifications = (() => {
    if (!currentUser) {
      return [];
    }

    const generatedNotifications = [];

    currentMonthBudgets.forEach((budget) => {
      const budgetAmount = Number(budget.amount || 0);

      if (budgetAmount <= 0) {
        return;
      }

      const spent = expenses
        .filter((expense) => {
          if (expense.category !== budget.category) {
            return false;
          }

          const expenseDate = new Date(expense.date);

          return (
            expenseDate.getMonth() + 1 === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        })
        .reduce(
          (total, expense) =>
            total + Number(expense.amount || 0),
          0
        );

      const percentage =
        (spent / budgetAmount) * 100;

      const alertThreshold = Number(
        budget.alertThreshold || 80
      );

      if (percentage >= 100) {
        generatedNotifications.push({
          id: `budget-exceeded-${budget._id}`,
          type: "danger",
          icon: "⚠️",
          title: "Budget exceeded",
          message: `${budget.category} spending has exceeded your ${formatCurrency(
            budgetAmount
          )} budget.`,
        });
      } else if (percentage >= alertThreshold) {
        generatedNotifications.push({
          id: `budget-warning-${budget._id}`,
          type: "warning",
          icon: "🟠",
          title: "Budget warning",
          message: `You've used ${percentage.toFixed(
            0
          )}% of your ${budget.category} budget. Your alert limit is ${alertThreshold}%.`,
        });
      }
    });

    return generatedNotifications;
  })();

  const unreadNotifications = notifications.filter(
    (notification) =>
      !readNotifications.includes(notification.id)
  );

  const handleNotificationClick = () => {
    setShowNotifications((current) => !current);
  };

  const markAllNotificationsAsRead = () => {
    setReadNotifications(
      notifications.map(
        (notification) => notification.id
      )
    );
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================
     NAVIGATION
  ========================= */

  const navigateTo = (page) => {
    setActivePage(page);
    setShowTransactionMenu(false);
    setShowNotifications(false);
  };

  /* =========================
     HEADER TRANSACTION BUTTON
  ========================= */

  const renderHeaderAction = () => {
    return (
      <div className="transaction-action">
        <button
          className="add-button"
          onClick={() =>
            setShowTransactionMenu((current) => !current)
          }
        >
          + Add Transaction ▾
        </button>

        {showTransactionMenu && (
          <div className="transaction-menu">
            <button
              onClick={() => {
                setActivePage("add-expense");
                setShowTransactionMenu(false);
              }}
            >
              <span>💸</span>
              Add Expense
            </button>

            <button
              onClick={() => {
                setActivePage("income");
                setShowTransactionMenu(false);
              }}
            >
              <span>💰</span>
              Add Income
            </button>
          </div>
        )}
      </div>
    );
  };

  /* =========================
     NOTIFICATION BUTTON
  ========================= */

  const renderNotifications = () => {
    return (
      <div className="notification-wrapper">
        <button
          className="notification"
          title="Notifications"
          onClick={handleNotificationClick}
          aria-label={`Notifications${
            unreadNotifications.length > 0
              ? `, ${unreadNotifications.length} unread`
              : ""
          }`}
          aria-expanded={showNotifications}
        >
          🔔

          {unreadNotifications.length > 0 && (
            <span className="notification-badge">
              {unreadNotifications.length > 9
                ? "9+"
                : unreadNotifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="notification-panel">
            <div className="notification-header">
              <div>
                <h3>Notifications</h3>

                <p>
                  {unreadNotifications.length > 0
                    ? `${unreadNotifications.length} unread alert${
                        unreadNotifications.length !== 1
                          ? "s"
                          : ""
                      }`
                    : "You're all caught up"}
                </p>
              </div>

              {unreadNotifications.length > 0 && (
                <button
                  type="button"
                  className="mark-read-button"
                  onClick={markAllNotificationsAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <div className="notification-empty-icon">
                    ✓
                  </div>

                  <strong>No notifications</strong>

                  <span>
                    Everything looks good with your finances.
                  </span>
                </div>
              ) : (
                notifications.map((notification) => {
                  const isRead =
                    readNotifications.includes(
                      notification.id
                    );

                  return (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        isRead ? "read" : "unread"
                      }`}
                    >
                      <div
                        className={`notification-item-icon ${notification.type}`}
                      >
                        {notification.icon}
                      </div>

                      <div className="notification-item-content">
                        <strong>
                          {notification.title}
                        </strong>

                        <p>{notification.message}</p>
                      </div>

                      {!isRead && (
                        <span className="notification-dot"></span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* =========================
     DASHBOARD
  ========================= */

  const renderDashboard = () => {
    const recentExpenses = expenses.slice(0, 5);
    const recentIncome = income.slice(0, 5);

    const monthName = currentDate.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

    return (
      <>
        {/* =========================
            TOPBAR
        ========================= */}

        <div className="topbar">
          <div>
            <p className="welcome">
              Welcome back, {currentUser?.name || "User"}
            </p>

            <h1>Dashboard</h1>
          </div>

          <div className="topbar-actions">
            {renderNotifications()}
            {renderHeaderAction()}
          </div>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="summary-grid dashboard-summary-grid">
          <div className="summary-card balance-card">
            <div className="card-header">
              <span>Total Balance</span>

              <div className="card-icon">₹</div>
            </div>

            <h2
              className={
                balance >= 0
                  ? "summary-balance-positive"
                  : "summary-balance-negative"
              }
            >
              {formatCurrency(balance)}
            </h2>

            <p
              className={
                balance >= 0 ? "positive" : "negative"
              }
            >
              Income minus expenses
            </p>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <span>Total Income</span>

              <div className="card-icon income-icon">↗</div>
            </div>

            <h2 className="positive">
              {formatCurrency(totalIncome)}
            </h2>

            <p className="positive">
              All recorded income
            </p>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <span>Total Expenses</span>

              <div className="card-icon expense-icon">↘</div>
            </div>

            <h2 className="negative">
              {formatCurrency(totalExpenses)}
            </h2>

            <p className="negative">
              All recorded expenses
            </p>
          </div>
        </div>

        {/* =========================
            EXISTING DASHBOARD ANALYTICS
        ========================= */}

        <div className="dashboard-insights-grid">
          {/* MONTHLY SPENDING */}

          <div className="panel insight-card">
            <div className="panel-heading">
              <div>
                <h3>Monthly Spending</h3>
                <p>{monthName}</p>
              </div>

              <div className="insight-icon spending-insight-icon">
                ₹
              </div>
            </div>

            <div className="insight-main-value">
              {formatCurrency(monthlySpending)}
            </div>

            <div className="insight-subtext">
              {monthlyExpenses.length} expense
              {monthlyExpenses.length !== 1 ? "s" : ""} this
              month
            </div>

            <div className="mini-progress">
              <div
                className="mini-progress-fill"
                style={{
                  width: `${Math.min(
                    monthlyExpenses.length > 0
                      ? (monthlySpending /
                          Math.max(totalExpenses, 1)) *
                          100
                      : 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>

            <div className="insight-footer">
              <span>Overall spending</span>

              <strong>
                {totalExpenses > 0
                  ? `${(
                      (monthlySpending /
                        totalExpenses) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </strong>
            </div>
          </div>

          {/* BUDGET USAGE */}

          <div className="panel insight-card">
            <div className="panel-heading">
              <div>
                <h3>Budget Usage</h3>
                <p>{monthName}</p>
              </div>

              <div className="insight-icon budget-insight-icon">
                ◉
              </div>
            </div>

            <div className="budget-insight-row">
              <div
                className="budget-circle"
                style={{
                  "--budget-progress": `${Math.min(
                    budgetUsagePercentage * 3.6,
                    360
                  )}deg`,
                }}
              >
                <div className="budget-circle-inner">
                  <strong>
                    {budgetUsagePercentage.toFixed(0)}%
                  </strong>

                  <span>used</span>
                </div>
              </div>

              <div className="budget-insight-details">
                <strong>
                  {formatCurrency(monthlySpending)}
                </strong>

                <span>
                  of {formatCurrency(totalMonthlyBudget)}
                </span>

                <small
                  className={
                    budgetRemaining >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {totalMonthlyBudget === 0
                    ? "No budget set"
                    : budgetRemaining >= 0
                    ? `${formatCurrency(
                        budgetRemaining
                      )} remaining`
                    : `${formatCurrency(
                        Math.abs(budgetRemaining)
                      )} over budget`}
                </small>
              </div>
            </div>

            <div className="budget-progress">
              <div
                className={`budget-progress-fill ${
                  budgetUsagePercentage >= 100
                    ? "over-budget"
                    : budgetUsagePercentage >= 80
                    ? "budget-warning"
                    : ""
                }`}
                style={{
                  width: `${budgetProgress}%`,
                }}
              ></div>
            </div>

            <div className="insight-footer">
              <span>
                {currentMonthBudgets.length} active budget
                {currentMonthBudgets.length !== 1
                  ? "s"
                  : ""}
              </span>

              <button
                className="small-link-button"
                onClick={() => setActivePage("budgets")}
              >
                Manage
              </button>
            </div>
          </div>

          {/* INCOME VS EXPENSES */}

          <div className="panel insight-card income-expense-card">
            <div className="panel-heading">
              <div>
                <h3>Income vs Expenses</h3>
                <p>{monthName}</p>
              </div>

              <div className="insight-icon comparison-insight-icon">
                ⇄
              </div>
            </div>

            <div className="comparison-values">
              <div>
                <span className="comparison-label">
                  Income
                </span>

                <strong className="positive">
                  {formatCurrency(monthlyIncomeTotal)}
                </strong>
              </div>

              <div>
                <span className="comparison-label">
                  Expenses
                </span>

                <strong className="negative">
                  {formatCurrency(monthlySpending)}
                </strong>
              </div>
            </div>

            <div className="comparison-bar">
              <div
                className="comparison-income"
                style={{
                  width: `${incomeComparisonPercentage}%`,
                }}
              ></div>

              <div
                className="comparison-expense"
                style={{
                  width: `${expenseComparisonPercentage}%`,
                }}
              ></div>
            </div>

            <div className="comparison-legend">
              <span>
                <i className="legend-dot income-dot"></i>
                Income
              </span>

              <span>
                <i className="legend-dot expense-dot"></i>
                Expenses
              </span>
            </div>

            <div className="comparison-result">
              <span>Monthly result</span>

              <strong
                className={
                  monthlyIncomeTotal - monthlySpending >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {formatCurrency(
                  monthlyIncomeTotal - monthlySpending
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOVED UP:
            RECENT TRANSACTIONS
        ===================================================== */}

        <div className="dashboard-grid">
          {/* RECENT EXPENSES */}

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Expenses</h3>
                <p>Your latest spending</p>
              </div>

              <button
                className="view-button"
                onClick={() => setActivePage("transactions")}
              >
                View All
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="empty-state">
                <div>₹</div>

                <h3>No expenses yet</h3>

                <p>
                  Start tracking your spending by adding
                  your first expense.
                </p>

                <button
                  className="save-button"
                  onClick={() =>
                    setActivePage("add-expense")
                  }
                >
                  Add Expense
                </button>
              </div>
            ) : (
              <div className="transaction-list">
                {recentExpenses.map((expense) => (
                  <div
                    className="transaction"
                    key={expense._id}
                  >
                    <div className="transaction-icon">
                      ₹
                    </div>

                    <div className="transaction-info">
                      <strong>{expense.name}</strong>

                      <span>
                        {expense.category} •{" "}
                        {formatDate(expense.date)}
                      </span>
                    </div>

                    <div className="amount negative">
                      -{formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT INCOME */}

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Income</h3>
                <p>Your latest earnings</p>
              </div>

              <button
                className="view-button"
                onClick={() => setActivePage("income")}
              >
                View All
              </button>
            </div>

            {recentIncome.length === 0 ? (
              <div className="empty-state">
                <div>↗</div>

                <h3>No income yet</h3>

                <p>
                  Add your income to start tracking your
                  balance.
                </p>

                <button
                  className="save-button"
                  onClick={() => setActivePage("income")}
                >
                  Add Income
                </button>
              </div>
            ) : (
              <div className="transaction-list">
                {recentIncome.map((item) => (
                  <div
                    className="transaction"
                    key={item._id}
                  >
                    <div className="transaction-icon">
                      ↗
                    </div>

                    <div className="transaction-info">
                      <strong>{item.source}</strong>

                      <span>
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <div className="amount positive">
                      +{formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            MOVED UP:
            CATEGORY ANALYTICS
        ===================================================== */}

        <div className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h3>Spending by Category</h3>
              <p>See where your money is going</p>
            </div>

            <span>
              Total:{" "}
              <strong className="negative">
                {formatCurrency(totalExpenses)}
              </strong>
            </span>
          </div>

          {categoryAnalytics.length === 0 ? (
            <div className="empty-state">
              <div>◉</div>

              <h3>No spending data yet</h3>

              <p>
                Add expenses to see your spending breakdown
                by category.
              </p>
            </div>
          ) : (
            <div className="category-list">
              {categoryAnalytics.map((item) => (
                <div
                  className="category-item"
                  key={item.category}
                >
                  <div className="category-info">
                    <div>
                      <strong>{item.category}</strong>

                      <span>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <strong className="negative">
                      {formatCurrency(item.amount)}
                    </strong>
                  </div>

                  <div className="category-progress">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            MOVED UP:
            TRANSACTION OVERVIEW
        ===================================================== */}

        <div className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h3>Transaction Overview</h3>

              <p>
                Total recorded transactions:{" "}
                {expenses.length + income.length}
              </p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-item">
              <span>Income Transactions</span>
              <strong>{income.length}</strong>
            </div>

            <div className="overview-item">
              <span>Expense Transactions</span>
              <strong>{expenses.length}</strong>
            </div>

            <div className="overview-item">
              <span>Total Income</span>

              <strong className="positive">
                {formatCurrency(totalIncome)}
              </strong>
            </div>

            <div className="overview-item">
              <span>Total Expenses</span>

              <strong className="negative">
                {formatCurrency(totalExpenses)}
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            FINANCIAL ANALYTICS
            THIS IS NOW THE LAST DASHBOARD SECTION
        ===================================================== */}

        <div className="analytics-section-header">
          <div>
            <h2>Financial Analytics</h2>

            <p>
              Understand your spending patterns and financial
              trends.
            </p>
          </div>

          <span className="analytics-period">
            Last 6 months
          </span>
        </div>

        {/* ANALYTICS SUMMARY */}

        <div className="analytics-summary-grid">
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">↗</div>

            <div>
              <span>Average Monthly Spending</span>

              <strong>
                {formatCurrency(averageMonthlySpending)}
              </strong>

              <small>
                Based on the last 6 months
              </small>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">◎</div>

            <div>
              <span>Top Spending Category</span>

              <strong>
                {topCategory
                  ? topCategory.category
                  : "No data"}
              </strong>

              <small>
                {topCategory
                  ? formatCurrency(topCategory.amount)
                  : "Add expenses to analyze"}
              </small>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">%</div>

            <div>
              <span>Monthly Change</span>

              <strong
                className={
                  spendingChange === null
                    ? ""
                    : spendingChange > 0
                    ? "negative"
                    : "positive"
                }
              >
                {spendingChange === null
                  ? "—"
                  : `${spendingChange > 0 ? "+" : ""}${spendingChange.toFixed(
                      1
                    )}%`}
              </strong>

              <small>
                {spendingChange === null
                  ? "No previous month data"
                  : spendingChange > 0
                  ? "Higher than previous month"
                  : spendingChange < 0
                  ? "Lower than previous month"
                  : "Same as previous month"}
              </small>
            </div>
          </div>
        </div>

        {/* ADVANCED ANALYTICS */}

        <div className="advanced-analytics-grid">
          {/* SIX MONTH TREND */}

          <div className="panel trend-panel">
            <div className="panel-heading">
              <div>
                <h3>Monthly Financial Trend</h3>

                <p>
                  Income and expenses over the last six
                  months
                </p>
              </div>

              <span>₹</span>
            </div>

            <div className="chart-legend">
              <span>
                <i className="chart-dot income-chart-dot"></i>
                Income
              </span>

              <span>
                <i className="chart-dot expense-chart-dot"></i>
                Expenses
              </span>
            </div>

            <div className="trend-chart">
              <div className="trend-y-axis">
                <span>
                  {formatCurrency(maxSixMonthValue)}
                </span>

                <span>
                  {formatCurrency(
                    maxSixMonthValue / 2
                  )}
                </span>

                <span>₹0</span>
              </div>

              <div className="trend-columns">
                {lastSixMonths.map((item) => {
                  const incomeHeight =
                    item.income > 0
                      ? Math.max(
                          (item.income /
                            maxSixMonthValue) *
                            100,
                          5
                        )
                      : 0;

                  const expenseHeight =
                    item.expenses > 0
                      ? Math.max(
                          (item.expenses /
                            maxSixMonthValue) *
                            100,
                          5
                        )
                      : 0;

                  return (
                    <div
                      className="trend-column"
                      key={`${item.year}-${item.month}`}
                    >
                      <div className="trend-bar-area">
                        <div className="trend-bars">
                          <div
                            className="trend-bar income-bar"
                            style={{
                              height: `${incomeHeight}%`,
                            }}
                            title={`Income: ${formatCurrency(
                              item.income
                            )}`}
                          >
                            {item.income > 0 && (
                              <span>
                                {formatCurrency(
                                  item.income
                                )}
                              </span>
                            )}
                          </div>

                          <div
                            className="trend-bar expense-bar"
                            style={{
                              height: `${expenseHeight}%`,
                            }}
                            title={`Expenses: ${formatCurrency(
                              item.expenses
                            )}`}
                          >
                            {item.expenses > 0 && (
                              <span>
                                {formatCurrency(
                                  item.expenses
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <strong className="trend-month">
                        {item.label}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="trend-bottom">
              <span>
                Total 6-month expenses
              </span>

              <strong className="negative">
                {formatCurrency(
                  lastSixMonths.reduce(
                    (total, item) =>
                      total + item.expenses,
                    0
                  )
                )}
              </strong>
            </div>
          </div>

          {/* CATEGORY DONUT */}

          <div className="panel category-chart-panel">
            <div className="panel-heading">
              <div>
                <h3>Expense Distribution</h3>

                <p>Where your money is going</p>
              </div>

              <span>
                {categoryAnalytics.length} categories
              </span>
            </div>

            {categoryAnalytics.length === 0 ? (
              <div className="analytics-empty">
                <div>◉</div>

                <strong>No category data</strong>

                <span>
                  Add expenses to see your spending
                  distribution.
                </span>
              </div>
            ) : (
              <div className="donut-layout">
                <div
                  className="category-donut"
                  style={{
                    background: donutBackground,
                  }}
                >
                  <div className="category-donut-inner">
                    <strong>
                      {formatCurrency(totalExpenses)}
                    </strong>

                    <span>Total spent</span>
                  </div>
                </div>

                <div className="donut-list">
                  {donutSegments.map((item) => (
                    <div
                      className="donut-item"
                      key={item.category}
                    >
                      <div className="donut-item-name">
                        <i
                          className="donut-color"
                          style={{
                            background: item.color,
                          }}
                        ></i>

                        <span>{item.category}</span>
                      </div>

                      <div className="donut-item-value">
                        <strong>
                          {formatCurrency(item.amount)}
                        </strong>

                        <small>
                          {item.percentage.toFixed(1)}%
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MONTHLY PERFORMANCE */}

        <div className="panel monthly-performance-panel">
          <div className="panel-heading">
            <div>
              <h3>Monthly Performance</h3>

              <p>
                Compare income, expenses and net result
              </p>
            </div>

            <span>6-month overview</span>
          </div>

          <div className="monthly-performance-list">
            {lastSixMonths.map((item) => {
              const totalActivity =
                item.income + item.expenses;

              const incomeWidth =
                totalActivity > 0
                  ? (item.income / totalActivity) * 100
                  : 50;

              const expenseWidth =
                totalActivity > 0
                  ? (item.expenses / totalActivity) * 100
                  : 50;

              return (
                <div
                  className="monthly-performance-row"
                  key={`performance-${item.year}-${item.month}`}
                >
                  <div className="monthly-performance-date">
                    <strong>{item.label}</strong>

                    <span>{item.year}</span>
                  </div>

                  <div className="monthly-performance-bar">
                    <div
                      className="monthly-income-fill"
                      style={{
                        width: `${incomeWidth}%`,
                      }}
                    ></div>

                    <div
                      className="monthly-expense-fill"
                      style={{
                        width: `${expenseWidth}%`,
                      }}
                    ></div>
                  </div>

                  <div className="monthly-performance-values">
                    <span className="positive">
                      +{formatCurrency(item.income)}
                    </span>

                    <span className="negative">
                      -{formatCurrency(item.expenses)}
                    </span>

                    <strong
                      className={
                        item.balance >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {formatCurrency(item.balance)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  /* =========================
     ADD EXPENSE PAGE
  ========================= */

  const renderAddExpense = () => {
    return (
      <>
        <div className="topbar">
          <div>
            <p className="welcome">Transactions</p>

            <h1>Add Expense</h1>
          </div>
        </div>

        <div className="form-page">
          <div className="form-container">
            <div className="form-title">
              <div className="form-icon">₹</div>

              <div>
                <h2>Record New Expense</h2>

                <p>Add your expense details below.</p>
              </div>
            </div>

            <form
              className="expense-form"
              onSubmit={handleAddExpense}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Expense Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={expenseForm.name}
                    onChange={handleExpenseInputChange}
                    placeholder="e.g. Groceries"
                  />
                </div>

                <div className="form-group">
                  <label>Amount *</label>

                  <div className="amount-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseInputChange}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>

                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>

                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseInputChange}
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Rent">Rent</option>
                    <option value="Bills">Bills</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Entertainment">
                      Entertainment
                    </option>
                    <option value="Travel">Travel</option>
                    <option value="Subscriptions">
                      Subscriptions
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method *</label>

                  <select
                    name="paymentMethod"
                    value={expenseForm.paymentMethod}
                    onChange={handleExpenseInputChange}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">
                      Debit Card
                    </option>
                    <option value="Credit Card">
                      Credit Card
                    </option>
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>

                  <input
                    type="text"
                    name="notes"
                    value={expenseForm.notes}
                    onChange={handleExpenseInputChange}
                    placeholder="Optional note"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setActivePage("dashboard")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };

  /* =========================
     TRANSACTIONS PAGE
  ========================= */

  const renderTransactions = () => {
    return (
      <>
        <div className="topbar">
          <div>
            <p className="welcome">Financial Records</p>

            <h1>Transactions</h1>
          </div>
        </div>

        <div className="panel transactions-page">
          <div className="panel-heading">
            <div>
              <h3>All Expenses</h3>

              <p>Manage all your recorded expenses.</p>
            </div>

            <span>
              Total:{" "}
              <strong className="negative">
                {formatCurrency(totalExpenses)}
              </strong>
            </span>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <div>₹</div>

              <h3>No expenses found</h3>

              <p>
                You haven't recorded any expenses yet.
              </p>

              <button
                className="save-button"
                onClick={() =>
                  setActivePage("add-expense")
                }
              >
                Add Expense
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{expense.name}</td>

                      <td>{expense.category}</td>

                      <td>{expense.paymentMethod}</td>

                      <td>{formatDate(expense.date)}</td>

                      <td className="negative">
                        {formatCurrency(expense.amount)}
                      </td>

                      <td>
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteExpense(
                              expense._id
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  /* =========================
     INCOME PAGE
  ========================= */

  const renderIncome = () => {
    return (
      <>
        <div className="topbar">
          <div>
            <p className="welcome">Financial Records</p>

            <h1>Income</h1>
          </div>
        </div>

        <div className="form-page">
          <div className="form-container">
            <div className="form-title">
              <div className="form-icon">↗</div>

              <div>
                <h2>Add Income</h2>

                <p>
                  Record your salary, earnings or other
                  income.
                </p>
              </div>
            </div>

            <form
              className="expense-form"
              onSubmit={handleAddIncome}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Income Source *</label>

                  <input
                    type="text"
                    name="source"
                    value={incomeForm.source}
                    onChange={handleIncomeInputChange}
                    placeholder="e.g. Salary"
                  />
                </div>

                <div className="form-group">
                  <label>Amount *</label>

                  <div className="amount-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="amount"
                      value={incomeForm.amount}
                      onChange={handleIncomeInputChange}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>

                  <input
                    type="date"
                    name="date"
                    value={incomeForm.date}
                    onChange={handleIncomeInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>

                  <input
                    type="text"
                    name="description"
                    value={incomeForm.description}
                    onChange={handleIncomeInputChange}
                    placeholder="e.g. Monthly salary"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setIncomeForm({
                      source: "",
                      amount: "",
                      date: "",
                      description: "",
                    })
                  }
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h3>Income History</h3>

              <p>
                View all your recorded income.
              </p>
            </div>

            <span>
              Total:{" "}
              <strong className="positive">
                {formatCurrency(totalIncome)}
              </strong>
            </span>
          </div>

          {income.length === 0 ? (
            <div className="empty-state">
              <div>↗</div>

              <h3>No income records found</h3>

              <p>
                Add your first income record above.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {income.map((item) => (
                    <tr key={item._id}>
                      <td>{item.source}</td>

                      <td>{formatDate(item.date)}</td>

                      <td>
                        {item.description || "-"}
                      </td>

                      <td className="positive">
                        +{formatCurrency(item.amount)}
                      </td>

                      <td>
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteIncome(item._id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  /* =========================
     BUDGET PAGE
  ========================= */

  const renderBudgets = () => {
    const getSpentForCategory = (category) => {
      return expenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);

          return (
            expense.category === category &&
            expenseDate.getMonth() + 1 === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        })
        .reduce(
          (total, expense) =>
            total + Number(expense.amount || 0),
          0
        );
    };

    const formatMonth = (month, year) => {
      return new Date(year, month - 1).toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric",
        }
      );
    };

    return (
      <>
        <div className="topbar">
          <div>
            <p className="welcome">Financial Planning</p>

            <h1>Budgets</h1>
          </div>
        </div>

        <div className="form-page">
          <div className="form-container">
            <div className="form-title">
              <div className="form-icon">◉</div>

              <div>
                <h2>Set a Budget</h2>

                <p>
                  Set spending limits for your categories.
                </p>
              </div>
            </div>

            <form
              className="expense-form"
              onSubmit={handleAddBudget}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>

                  <select
                    name="category"
                    value={budgetForm.category}
                    onChange={handleBudgetInputChange}
                  >
                    <option value="Food">Food</option>

                    <option value="Transport">
                      Transport
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Rent">Rent</option>

                    <option value="Bills">Bills</option>

                    <option value="Education">
                      Education
                    </option>

                    <option value="Healthcare">
                      Healthcare
                    </option>

                    <option value="Entertainment">
                      Entertainment
                    </option>

                    <option value="Travel">Travel</option>

                    <option value="Subscriptions">
                      Subscriptions
                    </option>

                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Budget Amount</label>

                  <div className="amount-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="amount"
                      placeholder="5000"
                      min="0"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={handleBudgetInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month</label>

                  <select
                    name="month"
                    value={budgetForm.month}
                    onChange={handleBudgetInputChange}
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option
                        value={index + 1}
                        key={month}
                      >
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Year</label>

                  <input
                    type="number"
                    name="year"
                    min="2020"
                    value={budgetForm.year}
                    onChange={handleBudgetInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Alert me when spending reaches
                  </label>

                  <select
                    name="alertThreshold"
                    value={budgetForm.alertThreshold}
                    onChange={handleBudgetInputChange}
                  >
                    <option value="70">
                      70% of budget
                    </option>

                    <option value="80">
                      80% of budget
                    </option>

                    <option value="90">
                      90% of budget
                    </option>

                    <option value="100">
                      100% of budget
                    </option>
                  </select>

                  <small className="form-help-text">
                    You'll receive a notification when
                    spending reaches this percentage of
                    your budget.
                  </small>
                </div>

                <div className="form-group">
                  <label>Notification Preview</label>

                  <div className="notification-preview">
                    🔔 Alert at{" "}
                    <strong>
                      {budgetForm.alertThreshold}%
                    </strong>{" "}
                    of your budget
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setBudgetForm({
                      category: "Food",
                      amount: "",
                      month:
                        new Date().getMonth() + 1,
                      year:
                        new Date().getFullYear(),
                      alertThreshold: 80,
                    })
                  }
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h3>Current Budgets</h3>

              <p>
                {formatMonth(
                  currentMonth,
                  currentYear
                )}
              </p>
            </div>

            <span>
              {currentMonthBudgets.length} budget
              {currentMonthBudgets.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {currentMonthBudgets.length === 0 ? (
            <div className="empty-state">
              <div>◉</div>

              <h3>No budgets set</h3>

              <p>
                Create a budget above to start tracking
                your spending.
              </p>
            </div>
          ) : (
            <div className="category-list">
              {currentMonthBudgets.map((budget) => {
                const spent = getSpentForCategory(
                  budget.category
                );

                const budgetAmount =
                  Number(budget.amount) || 0;

                const percentage =
                  budgetAmount > 0
                    ? (spent / budgetAmount) * 100
                    : 0;

                const progress = Math.min(
                  percentage,
                  100
                );

                const remaining =
                  budgetAmount - spent;

                const alertThreshold = Number(
                  budget.alertThreshold || 80
                );

                return (
                  <div
                    className="category-item"
                    key={budget._id}
                  >
                    <div className="category-info">
                      <div>
                        <strong>
                          {budget.category}
                        </strong>

                        <span>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <strong
                        className={
                          remaining >= 0
                            ? "positive"
                            : "negative"
                        }
                      >
                        {formatCurrency(spent)} /{" "}
                        {formatCurrency(budgetAmount)}
                      </strong>
                    </div>

                    <div className="category-progress">
                      <div
                        className="category-progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>
                    </div>

                    <div
                      className={
                        remaining >= 0
                          ? "budget-remaining"
                          : "budget-over"
                      }
                    >
                      {remaining >= 0
                        ? `${formatCurrency(
                            remaining
                          )} remaining`
                        : `${formatCurrency(
                            Math.abs(remaining)
                          )} over budget`}
                    </div>

                    <div className="budget-alert-display">
                      🔔 Alert at {alertThreshold}%
                    </div>

                    <button
                      className="delete-button budget-delete"
                      onClick={() =>
                        handleDeleteBudget(
                          budget._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =========================
     SETTINGS PAGE
  ========================= */

  const renderSettings = () => {
    return (
      <Settings
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  };

  /* =========================
     PAGE CONTENT
  ========================= */

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return renderDashboard();

      case "add-expense":
        return renderAddExpense();

      case "transactions":
        return renderTransactions();

      case "income":
        return renderIncome();

      case "budgets":
        return renderBudgets();

      case "settings":
        return renderSettings();

      default:
        return renderDashboard();
    }
  };

  /* =========================
     SHOW LOGIN
  ========================= */

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  /* =========================
     MAIN APP
  ========================= */

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">₹</div>

          <div>
            <h2>Smart Expense</h2>
            <span>Tracker</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigateTo("dashboard")}
          >
            <span className="nav-icon">⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "add-expense"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigateTo("add-expense")}
          >
            <span className="nav-icon">＋</span>
            Add Expense
          </button>

          <button
            className={
              activePage === "transactions"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigateTo("transactions")}
          >
            <span className="nav-icon">▤</span>
            Transactions
          </button>

          <button
            className={
              activePage === "income"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigateTo("income")}
          >
            <span className="nav-icon">↗</span>
            Income
          </button>

          <button
            className={
              activePage === "budgets"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigateTo("budgets")}
          >
            <span className="nav-icon">◉</span>
            Budgets
          </button>

          <button
            className={
              activePage === "settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigateTo("settings")}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {currentUser?.name
                ? currentUser.name
                    .substring(0, 2)
                    .toUpperCase()
                : "U"}
            </div>

            <div>
              <strong>
                {currentUser?.name || "User"}
              </strong>

              <span>
                {currentUser?.email ||
                  "Personal Account"}
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;