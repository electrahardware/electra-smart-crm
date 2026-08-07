import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/electra-logo.png";
import officeBackground from "../assets/images/login-office-background.png";

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
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${officeBackground})` }}
    >
      <div className="absolute inset-0 bg-black/[.45]" />
      <form
        onSubmit={handleLogin}
        className="relative w-[calc(100%_-_40px)] max-w-[360px] rounded-[15px] border border-white/[.08] bg-[rgb(20_20_22_/_0.75)] p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,.4)] backdrop-blur-[16px] sm:w-full sm:max-w-[380px] sm:p-9 lg:max-w-[420px]"
      >
        <div className="mb-8 text-center">
          <img src={logo} alt="Electra Hardware" className="mx-auto mb-6 w-48 drop-shadow-[0_6px_18px_rgba(0,0,0,.6)]" />
          <h1 className="text-2xl font-bold tracking-[-.035em] text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-300">Sign in to your Electra Smart CRM workspace</p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 h-[50px] w-full rounded-xl border border-white! bg-white! px-4 text-[#111111] placeholder:text-[#666666]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 h-[50px] w-full rounded-xl border border-white! bg-white! px-4 text-[#111111] placeholder:text-[#666666]"
        />

        <button className="h-[50px] w-full rounded-xl bg-[#e31e24] font-semibold text-white shadow-[0_8px_20px_rgba(227,30,36,.35)] hover:bg-[#c9161c]">
          Login
        </button>
      </form>
    </div>
  );
}
