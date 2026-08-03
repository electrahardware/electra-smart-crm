import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/electra-logo.png";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    const user = sessionStorage.getItem("user");

    if (token && user) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);

        return;
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login Successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error) {
      console.error(error);

      toast.error("Login failed.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(227,30,36,.28),transparent_30%),radial-gradient(circle_at_82%_76%,rgba(255,255,255,.09),transparent_26%),linear-gradient(135deg,#0a0a0b,#1d1d20_52%,#090909)]" />
      <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full border border-white/8 bg-white/4 blur-3xl" />
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white/95 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9"
      >
        <div className="mb-8 text-center">
          <img src={logo} alt="Electra Hardware" className="mx-auto mb-5 w-44" />
          <h1 className="text-2xl font-bold tracking-[-.035em] text-zinc-900">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to your Electra Smart CRM workspace</p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full border px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full border px-4 py-3"
        />

        <button className="w-full rounded-xl bg-[#e31e24] py-3 font-semibold text-white shadow-[0_8px_18px_rgba(227,30,36,.25)] hover:bg-[#c9161c]">
          Login
        </button>
      </form>
    </div>
  );
}
