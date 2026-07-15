import MainLayout from "../layouts/MainLayout";

export default function UserManagement() {

  return (

    <MainLayout>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">

            👥 User Management

          </h1>

          <p className="mt-2 text-slate-500">

            Manage CRM users and permissions.

          </p>

        </div>

        <button
          className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + Add User
        </button>

      </div>

      <div className="rounded-2xl border bg-white p-8">

        <h2 className="text-xl font-bold">

          Users

        </h2>

        <p className="mt-2 text-slate-500">

          No users loaded yet.

        </p>

      </div>

    </MainLayout>

  );

}