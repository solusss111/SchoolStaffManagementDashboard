import { Users, FileCheck, Calendar, BookOpen, FileText, Upload } from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const menuItems = [
  { id: 'staff', label: 'Сотрудники', icon: Users },
  { id: 'attestation', label: 'Аттестация', icon: FileCheck },
  { id: 'tariff', label: 'Тариф (1 сентября / 5 января)', icon: Calendar },
  { id: 'guide', label: 'Руководство', icon: BookOpen },
  { id: 'reports', label: 'Отчеты', icon: FileText },
  { id: 'import', label: 'Импорт Excel', icon: Upload },
];

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col fixed left-0 top-0">
      {/* Logo/Title */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Система учета</h1>
        <p className="text-sm text-muted-foreground mt-1">Школьный персонал</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 Школа №1</p>
      </div>
    </div>
  );
}
