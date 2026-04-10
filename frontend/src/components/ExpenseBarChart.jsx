import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ExpenseBarChart({ expenses, theme = "dark" }) {
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

  const categoryData = expenses.reduce((acc, item) => {
    const cat = item.category || "Other";
    acc[cat] = (acc[cat] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryData).sort(
    (a, b) => b[1] - a[1]
  );

  const labels = sortedCategories.map(([category]) => category);
  const values = sortedCategories.map(([, amount]) => amount);

  const colors = labels.map((_, i) => `hsl(${(i * 50) % 360}, 70%, 50%)`);

  const data = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: values,
        backgroundColor: colors,
        borderRadius: 8,
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
        text: "Category-wise Expenses",
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
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default ExpenseBarChart;