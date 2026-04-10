import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function CategoryPieChart({ expenses, theme = "dark" }) {
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

  const categoryData = expenses.reduce((acc, item) => {
    const cat = item.category || "Other";
    acc[cat] = (acc[cat] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const labels = Object.keys(categoryData);
  const values = Object.values(categoryData);

  const colors = labels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 50%)`);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
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
        text: "Category-wise Expense",
        color: textColor,
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
      },
    },
  };

  return (
    <div className={`${cardClass} p-4 rounded-xl h-full shadow`}>
      <div className="h-[300px]">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

export default CategoryPieChart;
