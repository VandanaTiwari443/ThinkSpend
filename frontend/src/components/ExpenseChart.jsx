import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function ExpenseChart({ expenses, theme = "dark" }) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#fff" : "#111827";
  const cardClass = isDark
    ? "bg-gray-800 text-gray-300"
    : "bg-white text-gray-600";

  if (!expenses || expenses.length === 0) {
    return (
      <div className={`${cardClass} p-4 rounded-xl text-center`}>
        No chart data available 📊
      </div>
    );
  }

  const necessaryTotal = expenses
    .filter((item) => item.isNecessary === true)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const wasteTotal = expenses
    .filter((item) => item.isNecessary === false)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const total = necessaryTotal + wasteTotal;

  const data = {
    labels: ["Necessary", "Unnecessary"],
    datasets: [
      {
        label: "Expense Type",
        data: [necessaryTotal, wasteTotal],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: "Necessary vs Unnecessary",
        color: textColor,
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = total
              ? ((value / total) * 100).toFixed(1)
              : 0;

            return `${context.label}: ₹${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={`${cardClass} p-4 rounded-xl h-full shadow`}>
      <div className="h-[300px]">
        <Pie data={data} options={options} />
      </div>

      <div className={`text-sm mt-3 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        Necessary: ₹{necessaryTotal} | Waste: ₹{wasteTotal}
      </div>
    </div>
  );
}

export default ExpenseChart;