import { useState, useEffect } from "react";
import axios from "axios";
import ExpenseModal from "../components/ExpenseModal";
import ExpenseChart from "../components/ExpenseChart";
import ExpenseBarChart from "../components/ExpenseBarChart";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import CategoryPieChart from "../components/CategoryPieChart";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [newBudget, setNewBudget] = useState("");

  const navigate = useNavigate();

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const res = await axios.get("hhttps://thinkspend.onrender.com/api/expenses", {
        headers: {
          Authorization: token,
        },
      });

      setExpenses(res.data);
    } catch (error) {
      console.log("Error fetching expenses:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const res = await axios.get("https://thinkspend.onrender.com/api/users/profile", {
        headers: {
          Authorization: token,
        },
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      console.log("Profile error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.budget && Number(user.budget) > 0) {
      setNewBudget(String(user.budget));
    }
  }, [user]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://thinkspend.onrender.com/api/expenses/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      fetchExpenses();
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const handleEdit = (item) => {
    setSelectedExpense(item);
    setOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSaveBudget = async () => {
    const budgetValue = Number(newBudget);

    if (!newBudget || Number.isNaN(budgetValue) || budgetValue <= 0) {
      alert("Please enter a valid budget");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "https://thinkspend.onrender.com/api/users/budget",
        { budget: budgetValue },
        {
          headers: { Authorization: token },
        },
      );

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      alert("Budget updated ✅");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Failed to update budget");
    }
  };

  const total = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const waste = expenses
    .filter((item) => item.isNecessary === false)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const budget = Number(user?.budget || 0);

  const budgetUsedPercent =
    budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  const getExpenseAdvice = (item) => {
    const amount = Number(item.amount || 0);
    const isNecessary = item.isNecessary;
    const currentTotal = total;
    const currentWaste = waste;

    if (isNecessary && amount <= 1000) {
      return {
        text: "Safe to spend",
        color: "bg-green-500/20 text-green-400 border border-green-500/30",
      };
    }

    if (budget > 0 && isNecessary && currentTotal + amount > budget) {
      return {
        text: "Budget risk",
        color: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
      };
    }

    if (!isNecessary && amount >= 500) {
      return {
        text: "Avoid this expense",
        color: "bg-red-500/20 text-red-400 border border-red-500/30",
      };
    }

    if (!isNecessary && currentWaste >= 1000) {
      return {
        text: "Think again",
        color: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
      };
    }

    return {
      text: "Think before spending",
      color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    };
  };

  const uniqueCategories = [
    "All",
    ...new Set(expenses.map((item) => item.category).filter(Boolean)),
  ];

  const filteredExpenses =
    filter === "All"
      ? expenses
      : expenses.filter((item) => item.category === filter);

  const dateWiseExpenses = filteredExpenses.filter((item) => {
    const itemDate = item.date ? new Date(item.date) : null;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (!itemDate) return true;
    if (start && itemDate < start) return false;

    if (end) {
      const adjustedEnd = new Date(end);
      adjustedEnd.setHours(23, 59, 59, 999);
      if (itemDate > adjustedEnd) return false;
    }

    return true;
  });

  const finalExpenses = dateWiseExpenses.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.note?.toLowerCase().includes(searchText) ||
      item.category?.toLowerCase().includes(searchText)
    );
  });

  const shoppingTotal = expenses
    .filter((item) => item.category === "Shopping")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const alerts = [];

  if (total === 0) {
    alerts.push({
      text: "No expenses added yet. Start tracking to get smart insights.",
      type: "info",
    });
  }

  if (budget <= 0) {
    alerts.push({
      text: "Please set a valid budget to enable budget alerts and accurate score.",
      type: "info",
    });
  }

  if (budget > 0 && total >= 0.8 * budget && total < budget) {
    alerts.push({
      text: "Warning: You have used more than 80% of your monthly budget.",
      type: "warning",
    });
  }

  if (budget > 0 && total >= budget) {
    alerts.push({
      text: "Alert: Your monthly budget has been exceeded.",
      type: "danger",
    });
  }

  if (waste >= 1000) {
    alerts.push({
      text: "Your unnecessary spending is high. Try delaying non-essential purchases.",
      type: "danger",
    });
  }

  if (shoppingTotal >= 1500) {
    alerts.push({
      text: "Shopping expenses are unusually high this month.",
      type: "warning",
    });
  }

  let moneyScore = 100;

  if (budget <= 0) {
    moneyScore = 0;
  } else {
    if (total > budget) {
      moneyScore -= 30;
    } else if (total > budget * 0.8) {
      moneyScore -= 15;
    }

    if (waste > 1500) {
      moneyScore -= 30;
    } else if (waste > 1000) {
      moneyScore -= 20;
    } else if (waste > 500) {
      moneyScore -= 10;
    }

    if (shoppingTotal > 2000) {
      moneyScore -= 20;
    } else if (shoppingTotal > 1500) {
      moneyScore -= 10;
    }

    moneyScore = Math.max(0, Math.min(100, moneyScore));
  }

  const getScoreLabel = () => {
    if (budget <= 0) {
      return {
        text: "Set Budget",
        color: "text-blue-400",
      };
    }

    if (moneyScore >= 85) {
      return {
        text: "Excellent",
        color: "text-green-400",
      };
    }

    if (moneyScore >= 65) {
      return {
        text: "Good",
        color: "text-yellow-300",
      };
    }

    return {
      text: "Needs Improvement",
      color: "text-red-400",
    };
  };

  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const mutedText = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const subtleText = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const inputClass =
    theme === "dark"
      ? "bg-gray-800 text-white border-gray-700"
      : "bg-white text-black border-gray-300";
  const tableHeadText = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const tableBorder = theme === "dark" ? "border-gray-700" : "border-gray-300";
  const hoverRow =
    theme === "dark" ? "hover:bg-gray-700/40" : "hover:bg-gray-100";

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <div
        className={`flex justify-between items-center mb-6 p-4 rounded-xl shadow ${cardBg}`}
      >
        <div>
          <h1 className="text-2xl font-bold">ThinkSpend 💸</h1>
          <p className={`${mutedText} text-sm mt-1`}>
            Welcome, {user?.name || "User"} 👋
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className={`text-sm ${subtleText}`}>
              {user?.email || "No email"}
            </p>
          </div>

          <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-slate-200 text-black"
                : "bg-gray-700 text-white"
            }`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow ${cardBg}`}>
          <h2 className={mutedText}>Total Expense</h2>
          <p className="text-2xl font-bold mt-2">₹{total}</p>
        </div>

        <div className={`p-4 rounded-xl shadow ${cardBg}`}>
          <h2 className={mutedText}>Waste 😬</h2>
          <p className="text-2xl font-bold text-red-400 mt-2">₹{waste}</p>
        </div>

        <div className={`p-4 rounded-xl shadow ${cardBg}`}>
          <h2 className={mutedText}>Budget</h2>
          <p className="text-2xl font-bold mt-2">₹{budget}</p>

          <div className="mt-4">
            <div className={`flex justify-between text-xs mb-1 ${subtleText}`}>
              <span>Used: ₹{total}</span>
              <span>
                {budget > 0 ? `${budgetUsedPercent.toFixed(0)}%` : "0%"}
              </span>
            </div>

            <div
              className={`w-full h-3 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className={`h-3 rounded-full ${
                  budget > 0 && total > budget
                    ? "bg-red-500"
                    : budget > 0 && total > budget * 0.8
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${budgetUsedPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl shadow ${cardBg}`}>
          <h2 className={mutedText}>Money Score</h2>
          <p className="text-2xl font-bold mt-2">{moneyScore}/100</p>
          <p className={`text-sm mt-1 font-medium ${getScoreLabel().color}`}>
            {getScoreLabel().text}
          </p>
        </div>

        <div className={`p-4 rounded-xl shadow ${cardBg}`}>
          <label className={`block text-sm mb-2 ${mutedText}`}>
            Set Budget
          </label>

          <input
            type="number"
            min="1"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
            placeholder="Enter budget"
          />

          <button
            onClick={handleSaveBudget}
            className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
          >
            Update Budget
          </button>
        </div>
      </div>

      {/* Financial Health */}
      <div className={`${cardBg} p-3 rounded-lg mb-6 shadow`}>
        <p className={`text-sm ${mutedText}`}>
          Financial Health:{" "}
          <span className={`font-semibold ${getScoreLabel().color}`}>
            {getScoreLabel().text}
          </span>
        </p>
      </div>

      {/* Smart Alerts */}
      <div className="space-y-3 mb-6">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              alert.type === "danger"
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : alert.type === "warning"
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30"
            }`}
          >
            {alert.text}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <button
          onClick={() => {
            setSelectedExpense(null);
            setOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
        >
          + Add Expense
        </button>

        <div>
          <label className={`block text-sm mb-1 ${mutedText}`}>Category</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${inputClass}`}
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm mb-1 ${mutedText}`}>Search</label>
          <input
            type="text"
            placeholder="Search note/category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-1 ${mutedText}`}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${inputClass}`}
          />
        </div>

        <div>
          <label className={`block text-sm mb-1 ${mutedText}`}>To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${inputClass}`}
          />
        </div>
      </div>

      {/* Expense Table */}
      <div className={`p-4 rounded-xl shadow overflow-x-auto ${cardBg}`}>
        <h2 className="mb-4 text-lg font-semibold">Recent Expenses</h2>

        {loading ? (
          <p className="text-center py-6">Loading... ⏳</p>
        ) : finalExpenses.length === 0 ? (
          <div className={`text-center py-8 ${mutedText}`}>
            <p className="text-lg font-medium">No expenses yet 💸</p>
            <p className="text-sm mt-2">
              Start by adding your first expense 🚀
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr
                className={`border-b ${tableBorder} text-left ${tableHeadText}`}
              >
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Note</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Advice</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {finalExpenses.map((item) => (
                <tr
                  key={item._id}
                  className={`border-b ${tableBorder} ${hoverRow} transition`}
                >
                  <td className="py-3 px-3">
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "No date"}
                  </td>

                  <td className="py-3 px-3">
                    {item.category || "No category"}
                  </td>

                  <td className="py-3 px-3 font-medium">₹{item.amount || 0}</td>

                  <td className="py-3 px-3">
                    {item.note?.trim() ? item.note : "No note"}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.isNecessary
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {item.isNecessary ? "Necessary" : "Unnecessary"}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getExpenseAdvice(item).color
                      }`}
                    >
                      {getExpenseAdvice(item).text}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-yellow-400 hover:text-yellow-300 text-lg"
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-400 hover:text-red-300 text-lg"
                        title="Delete"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Extra Smart Advice */}
      {waste >= 1000 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 p-3 rounded-lg mt-6">
          Smart Advice: Your unnecessary spending is increasing. Try delaying
          non-essential purchases for 24 hours.
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        <ExpenseBarChart expenses={expenses} theme={theme} />
        <ExpenseChart expenses={expenses} theme={theme} />
        <MonthlyTrendChart expenses={expenses} theme={theme} />
        <CategoryPieChart expenses={expenses} theme={theme} />
      </div>

      {/* Modal */}
      <ExpenseModal
        key={selectedExpense?._id || "new"}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setSelectedExpense(null);
        }}
        refresh={fetchExpenses}
        editData={selectedExpense}
        total={total}
        budget={budget}
      />
    </div>
  );
}

export default Dashboard;
