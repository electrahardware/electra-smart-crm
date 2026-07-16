import MainLayout from "../layouts/MainLayout";
import { Navigate } from "react-router-dom";
import { isOwner } from "../utils/auth";
import { useEffect, useState } from "react";
import UserDialog from "../components/users/UserDialog";
import AddUserModal from "../components/settings/AddUserModal";

import {
  getUsers,
  type User,
} from "../services/userService";

export default function UserManagement() {

if (!isOwner()) {

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );

}

const [users, setUsers] =
  useState<User[]>([]);

const [loading, setLoading] =
  useState(true);

const [dialogOpen, setDialogOpen] =
  useState(false);

const [openModal, setOpenModal] =
  useState(false);  

async function loadUsers() {

  try {

    const data =
      await getUsers();

    setUsers(data);

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }

}

useEffect(() => {

  loadUsers();

}, []);

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
  onClick={() =>
    setDialogOpen(true)
  }
  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
>
  + Add User
</button>

      </div>

      <div className="rounded-2xl border bg-white p-8">

        <h2 className="text-xl font-bold">

          Users

        </h2>

        {loading ? (

  <p className="mt-2 text-slate-500">

    Loading users...

  </p>

) : (

  <div className="mt-6 overflow-x-auto">

    <table className="min-w-full">

      <thead>

        <tr className="border-b">

          <th className="px-4 py-3 text-left">
            Name
          </th>

          <th className="px-4 py-3 text-left">
            Email
          </th>

          <th className="px-4 py-3 text-left">
            Role
          </th>

          <th className="px-4 py-3 text-left">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {users.map((user) => (

          <tr
            key={user.id}
            className="border-b"
          >

            <td className="px-4 py-3">
              {user.name}
            </td>

            <td className="px-4 py-3">
              {user.email}
            </td>

            <td className="px-4 py-3">
              {user.role}
            </td>

            <td className="px-4 py-3">

              {user.isActive
                ? "🟢 Active"
                : "🔴 Disabled"}

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

)}

      </div>

      <AddUserModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  onSuccess={loadUsers}
/>

<UserDialog
  open={dialogOpen}
  onClose={() =>
    setDialogOpen(false)
  }
  onSuccess={loadUsers}
/>

    </MainLayout>

  );

}