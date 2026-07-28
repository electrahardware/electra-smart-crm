import MainLayout from "../layouts/MainLayout";
import { Navigate } from "react-router-dom";
import { isAdminOrManager } from "../utils/auth";
import { useEffect, useState } from "react";
import UserDialog from "../components/users/UserDialog";
import ResetPasswordDialog from "../components/users/ResetPasswordDialog";

import {
  getUsers,
  toggleUserStatus,
  deleteUser,
  resetPassword,
  type User,
} from "../services/userService";

export default function UserManagement() {

if (!isAdminOrManager()) {

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

const [selectedUser, setSelectedUser] =
  useState<User | null>(null);

const [passwordUser, setPasswordUser] =
  useState<User | null>(null);

const [newPassword, setNewPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

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
  onClick={() => {

  setSelectedUser(null);

  setDialogOpen(true);

}}
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

          <th className="px-4 py-3 text-center">

  Action

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

            <td className="px-4 py-3">

  <div className="flex justify-center gap-2">

    <button

      onClick={() => {

        setSelectedUser(user);

        setDialogOpen(true);

      }}

      className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"

    >

      ✏️ Edit

    </button>

    <button

  disabled={user.role === "Admin"}

  onClick={async () => {

    await toggleUserStatus(

      user.id,

      !user.isActive

    );

    await loadUsers();

  }}

  className="rounded-lg bg-amber-500 px-3 py-2 text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"

>

      {user.role === "Admin"
  ? "Protected"
  : user.isActive
    ? "Disable"
    : "Enable"}

    </button>

    <button

  onClick={() => {

    setPasswordUser(user);

    setNewPassword("");

    setConfirmPassword("");

  }}

  className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"

>

  🔑 Reset

</button>
    

    {user.role !== "Admin" && (



  <button

    onClick={async () => {

      if (

        !confirm(

          `Delete ${user.name}?`

        )

      ) {

        return;

      }

      await deleteUser(

        user.id

      );

      await loadUsers();

    }}

    className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"

  >

    🗑 Delete

  </button>

)}

  </div>

</td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

)}

      </div>

      

<UserDialog
  open={dialogOpen}
  user={selectedUser}
  onClose={() => {

    setDialogOpen(false);

    setSelectedUser(null);

  }}
  onSuccess={loadUsers}
/>

<ResetPasswordDialog
  open={passwordUser !== null}
  user={passwordUser}
  onClose={() => {

    setPasswordUser(null);

  }}
/>

    </MainLayout>

  );

}