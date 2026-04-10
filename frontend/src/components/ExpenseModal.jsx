import { useState } from "react";
import axios from "axios";

function ExpenseModal({ isOpen, onClose, refresh, editData, total, budget }) {
  const [amount, setAmount] = useState(editData ? String(editData.amount) : "");
  const [category, setCategory] = useState(editData?.category || "Food");
  const [note, setNote] = useState(editData?.note || "");
  const [isNecessary, setIsNecessary] = useState(editData?.isNecessary ?? true);
  const [date, setDate] = useState(
    editData?.date ? editData.date.slice(0, 10) : "",
  );
  // eslint-disable-next-line no-unused-vars
  const categories = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Rent",
    "Groceries",
    "Transport",
    "Subscriptions",
    "Other",
  ];
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!editData && total + Number(amount) > budget) {
        alert("Budget limit cross ho jayegi ❌ Expense add nahi ho sakta");
        return;
      }

      const data = {
        amount: Number(amount),
        category,
        note,
        isNecessary,
        date,
      };

      if (editData) {
        await axios.put(
          `http://localhost:5000/api/expenses/${editData._id}`,
          data,
          {
            headers: { Authorization: token },
          },
        );
      } else {
        await axios.post("http://localhost:5000/api/expenses", data, {
          headers: { Authorization: token },
        });
      }

      refresh();
      onClose();

      setAmount("");
      setCategory("Food");
      setNote("");
      setIsNecessary(true);
      setDate("");
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-xl w-80">
        <h2 className="mb-4">
          {editData ? "Edit Expense ✏️" : "Add Expense 💸"}
        </h2>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full p-2 mb-3 bg-gray-700 rounded"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Travel">Travel</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Rent">Rent</option>
          <option value="Groceries">Groceries</option>
          <option value="Transport">Transport</option>
          <option value="Subscriptions">Subscriptions</option>
          <option value="Other">Other</option>
        </select>

        {category === "Other" && (
          <input
            type="text"
            placeholder="Enter custom category"
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          />
        )}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          className="w-full p-2 mb-3 bg-gray-700 rounded"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 mb-3 bg-gray-700 rounded"
        />

        <div className="flex gap-3 mb-3">
          <button
            onClick={() => setIsNecessary(true)}
            className={
              isNecessary ? "bg-green-500 px-3 py-1" : "bg-gray-600 px-3 py-1"
            }
          >
            Yes
          </button>

          <button
            onClick={() => setIsNecessary(false)}
            className={
              !isNecessary ? "bg-red-500 px-3 py-1" : "bg-gray-600 px-3 py-1"
            }
          >
            No
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 w-full p-2 mb-2 rounded"
        >
          {editData ? "Update" : "Add"}
        </button>

        <button onClick={onClose} className="bg-gray-600 w-full p-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ExpenseModal;
