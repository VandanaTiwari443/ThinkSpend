import { useState } from "react";
import axios from "axios";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = { email, password };

      const res = await axios.post(
        "https://thinkspend-backend.onrender.com/api/auth/login",
        data
      );

      
      localStorage.setItem("token", res.data.token);

      alert("Login Success ✅");

    } catch (error) {
      console.log("Login error:", error.response?.data);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-6">

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2"
      >
        Login
      </button>

    </div>
  );
}

export default Login;