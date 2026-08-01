import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const check = setInterval(() => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
      }
    }, 10000);

    return () => {
      clearInterval(check);
    };
  }, [navigate]);
}
