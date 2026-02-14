import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { StaffList } from "./components/StaffList";
import ImportExcelPage from "./pages/ImportExcelPage";


function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-border p-8 text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">Страница в разработке</p>
    </div>
  );
}

const pathToKey: Record<string, string> = {
  "/staff": "staff",
  "/attestation": "attestation",
  "/tariff": "tariff",
  "/guide": "guide",
  "/reports": "reports",
  "/import": "import",
};

const keyToPath: Record<string, string> = {
  staff: "/staff",
  attestation: "/attestation",
  tariff: "/tariff",
  guide: "/guide",
  reports: "/reports",
  import: "/import",
};

const titles: Record<string, string> = {
  staff: "Сотрудники",
  attestation: "Аттестация",
  tariff: "Тариф (1 сентября / 5 января)",
  guide: "Руководство",
  reports: "Отчеты",
  import: "Импорт Excel",
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeMenuItem = pathToKey[location.pathname] ?? "staff";
  const pageTitle = titles[activeMenuItem] ?? "Сотрудники";

  const handleMenuClick = (key: string) => {
    navigate(keyToPath[key] ?? "/staff");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuClick} />

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Header */}
        <Header title={pageTitle} />

        {/* Page Content */}
        <main className="pt-16">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/staff" replace />} />

              <Route path="/staff" element={<StaffList />} />
              <Route path="/attestation" element={<PlaceholderPage title="Аттестация" />} />
              <Route path="/tariff" element={<PlaceholderPage title="Тариф" />} />
              <Route path="/guide" element={<PlaceholderPage title="Руководство" />} />
              <Route path="/reports" element={<PlaceholderPage title="Отчеты" />} />
              <Route path="/import" element={<ImportExcelPage />} />

              <Route path="*" element={<div>404</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
