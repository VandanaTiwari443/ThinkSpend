import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MonthlyTrendChart({ expenses, theme = "dark" }) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#fff" : "#111827";
  const gridColor = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
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

  const monthlyTotals = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  expenses.forEach((item) => {
    if (!item.date) return;

    const date = new Date(item.date);
    const monthIndex = date.getMonth();

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    monthlyTotals[months[monthIndex]] += Number(item.amount || 0);
  });

  const data = {
    labels: Object.keys(monthlyTotals),
    datasets: [
      {
        label: "Monthly Expense Trend",
        data: Object.values(monthlyTotals),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: "Monthly Expense Trend",
        color: textColor,
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return (
    <div className={`${cardClass} p-4 rounded-xl h-full shadow`}>
      <div className="h-[300px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default MonthlyTrendChart;