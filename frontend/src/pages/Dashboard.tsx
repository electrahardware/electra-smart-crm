import MainLayout from "../layouts/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Welcome to Electra Smart CRM 🚀
      </h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500">Today's Leads</p>
          <h1 className="text-4xl font-bold text-red-600 mt-2">18</h1>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500">Today's Follow-ups</p>
          <h1 className="text-4xl font-bold text-blue-600 mt-2">42</h1>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500">Pending Quotations</p>
          <h1 className="text-4xl font-bold text-orange-500 mt-2">11</h1>
        </div>
      </div>
    </MainLayout>
  );
}