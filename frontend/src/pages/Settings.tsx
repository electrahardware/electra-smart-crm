import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { isAdminOrManager } from "../utils/auth";

const menus = [

  {
    title: "Users",
    icon: "👥",
    description:
      "Manage CRM users",
  },

  {
    title: "Products",
    icon: "📦",
    description:
      "Manage product list",
  },

  {
    title: "Lead Sources",
    icon: "📂",
    description:
      "Manage lead sources",
  },

  {
    title: "Lead Status",
    icon: "📊",
    description:
      "Manage lead status",
  },

  {
    title: "Priority",
    icon: "⭐",
    description:
      "Manage priorities",
  },

  {
    title: "Company",
    icon: "🏢",
    description:
      "Company information",
  },

];

export default function Settings() {

  if (!isAdminOrManager()) {

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );

}

  const navigate = useNavigate();

  return (

    <MainLayout>

      <h1 className="mb-8 text-3xl font-bold">

        ⚙️ Settings

      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {menus.map((item) => (

          <button
  key={item.title}
  onClick={() => {

    if (item.title === "Users") {

      navigate("/settings/users");

    }

  }}
  className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:shadow-lg"
>

            <div className="text-5xl">

              {item.icon}

            </div>

            <h2 className="mt-5 text-xl font-bold">

              {item.title}

            </h2>

            <p className="mt-2 text-slate-500">

              {item.description}

            </p>

          </button>

        ))}

      </div>

    </MainLayout>

  );

}