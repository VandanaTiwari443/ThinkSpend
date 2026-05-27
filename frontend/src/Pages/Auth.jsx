import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        // 🔹 LOGIN
        const res = await axios.post(
          "https://thinkspend-backend.onrender.com/api/auth/login",
          { email, password }
        );

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Login Success ✅");
        navigate("/dashboard");
      } else {
        // 🔹 SIGNUP
        const res = await axios.post(
          "https://thinkspend-backend.onrender.com/api/auth/signup",
          { name, email, password }
        );

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        alert("Signup Success ✅");
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("ERROR:", error.response?.data);
      alert(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isLogin ? "Login 🔐" : "Signup 📝"}
        </h2>

        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 mb-3 rounded bg-gray-700 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 rounded bg-gray-700 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 w-full p-2 rounded mb-3"
        >
          {isLogin ? "Login" : "Signup"}
        </button>

        <p className="text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="text-blue-400 cursor-pointer ml-1"
            onClick={() => {
              setIsLogin(!isLogin);
              setName("");
              setEmail("");
              setPassword("");
            }}
          >
            {isLogin ? "Signup" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;