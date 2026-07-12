import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {

  const navigate = useNavigate();
  
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      const res =
        await fetch(
  `${import.meta.env.VITE_API_URL}/users/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        toast.error(data.message);

        return;

      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success(
  "Login Successful"
);

setTimeout(() => {

  navigate("/dashboard");

}, 600);

    } catch (error) {

      console.error(error);

      toast.error(
  "Login failed."
);

    }

  }

  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >

        <h1 className="mb-8 text-center text-3xl font-bold">

          Electra Smart CRM

        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-xl border px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="mb-6 w-full rounded-xl border px-4 py-3"
        />

        <button
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>

      </form>

    </div>

  );

}