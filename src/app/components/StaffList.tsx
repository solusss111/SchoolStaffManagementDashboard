import { useState } from 'react';
import { Search, Filter, Eye, Edit, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { loadStaff, saveStaff, type StaffRecord } from "../data/staffStore";


// Mock data for staff
const staffData = [
  {
    id: 1,
    name: 'Айтмуханова Айгуль Серикқызы',
    position: 'Учитель начальных классов',
    subject: 'Начальные классы',
    category: 'Высшая категория',
    assignmentDate: '15.03.2023',
    nextAttestation: '15.03.2028',
    status: 'active',
  },
  {
    id: 2,
    name: 'Смирнов Александр Петрович',
    position: 'Учитель математики',
    subject: 'Математика',
    category: 'Первая категория',
    assignmentDate: '01.09.2022',
    nextAttestation: '01.09.2027',
    status: 'active',
  },
  {
    id: 3,
    name: 'Нұрғалиева Гүлнар Бауыржанқызы',
    position: 'Учитель казахского языка',
    subject: 'Казахский язык',
    category: 'Высшая категория',
    assignmentDate: '20.01.2024',
    nextAttestation: '20.01.2029',
    status: 'active',
  },
  {
    id: 4,
    name: 'Петрова Елена Викторовна',
    position: 'Учитель физики',
    subject: 'Физика',
    category: 'Вторая категория',
    assignmentDate: '10.05.2021',
    nextAttestation: '10.05.2026',
    status: 'warning',
  },
  {
    id: 5,
    name: 'Сейдахметов Ерлан Маратұлы',
    position: 'Учитель истории',
    subject: 'История',
    category: 'Первая категория',
    assignmentDate: '01.02.2023',
    nextAttestation: '01.02.2028',
    status: 'active',
  },
  {
    id: 6,
    name: 'Козлова Мария Ивановна',
    position: 'Учитель химии',
    subject: 'Химия',
    category: 'Без категории',
    assignmentDate: '—',
    nextAttestation: '01.09.2026',
    status: 'danger',
  },
  {
    id: 7,
    name: 'Әбдіғалиев Нұрлан Қайратұлы',
    position: 'Учитель английского языка',
    subject: 'Английский язык',
    category: 'Высшая категория',
    assignmentDate: '12.11.2022',
    nextAttestation: '12.11.2027',
    status: 'active',
  },
  {
    id: 8,
    name: 'Иванова Ольга Сергеевна',
    position: 'Учитель биологии',
    subject: 'Биология',
    category: 'Первая категория',
    assignmentDate: '25.06.2023',
    nextAttestation: '25.06.2028',
    status: 'active',
  },
];


function calcStatus(nextAttestation?: string) {
  // nextAttestation может быть "2027" или "15.03.2028"
  const nowYear = new Date().getFullYear();

  const year = (() => {
    if (!nextAttestation) return null;
    const s = String(nextAttestation).trim();
    if (/^\d{4}$/.test(s)) return Number(s);
    // dd.mm.yyyy
    const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    return m ? Number(m[3]) : null;
  })();

  if (!year) return "active";
  if (year <= nowYear) return "danger";
  if (year === nowYear + 1) return "warning";
  return "active";
}

type UiStaff = {
  id: number;
  name: string;
  position: string;
  subject: string;
  category: string;
  assignmentDate: string;
  nextAttestation: string;
  status: string;
};

function mapImportedToUi(records: StaffRecord[]): UiStaff[] {
  return records.map((r, idx) => ({
    id: idx + 1,
    name: r.fullName,
    position: r.position ?? "—",
    subject: r.subject ?? "—",
    category: r.category ?? "—",
    assignmentDate: r.categoryDate ?? "—",
    nextAttestation: r.nextAttestation ?? "—",
    status: calcStatus(r.nextAttestation),
  }));
}


const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { label: 'Актуальна', color: 'bg-green-100 text-green-700 border-green-200' },
    warning: { label: 'Скоро истекает', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    danger: { label: 'Требуется', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
};

export function StaffList() {
  const [importedStaff, setImportedStaff] = useState(() => loadStaff());
  const importedUi = mapImportedToUi(importedStaff);

  const data: UiStaff[] = importedUi.length > 0 ? importedUi : staffData;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const total = data.length;
  const highCount = data.filter((s) => s.category.toLowerCase().includes("высш")).length;
  const warningCount = data.filter((s) => s.status === "warning").length;
  const dangerCount = data.filter((s) => s.status === "danger").length;


  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Поиск сотрудников..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {importedUi.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                saveStaff([]);
                setImportedStaff([]);
              }}
            >
              Очистить импорт
            </Button>
          )}
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Добавить сотрудника
          </Button>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Фильтры:</span>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="high">Высшая категория</SelectItem>
              <SelectItem value="second">Вторая категория</SelectItem>
              <SelectItem value="first">Первая категория</SelectItem>
              <SelectItem value="none">Без категории</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Предмет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все предметы</SelectItem>
              <SelectItem value="math">Математика</SelectItem>
              <SelectItem value="physics">Физика</SelectItem>
              <SelectItem value="chemistry">Химия</SelectItem>
              <SelectItem value="biology">Биология</SelectItem>
              <SelectItem value="history">История</SelectItem>
              <SelectItem value="kazakh">Казахский язык</SelectItem>
              <SelectItem value="english">Английский язык</SelectItem>
              <SelectItem value="primary">Начальные классы</SelectItem>
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Год аттестации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все годы</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
              <SelectItem value="2029">2029</SelectItem>
            </SelectContent>
          </Select>

          {(categoryFilter !== 'all' || subjectFilter !== 'all' || yearFilter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSubjectFilter('all');
                setYearFilter('all');
              }}
              className="text-sm text-primary hover:underline"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">ФИО</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Должность</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Предмет</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Категория</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Дата присвоения</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Следующая аттестация</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Статус</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((staff) => (
                <tr key={staff.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{staff.name}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{staff.position}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{staff.subject}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{staff.category}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{staff.assignmentDate}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{staff.nextAttestation}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={staff.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Показано <span className="font-medium">{data.length}</span> из{" "}
            <span className="font-medium">{data.length}</span> сотрудников
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего сотрудников</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Высшая категория</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{highCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Скоро истекает</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{warningCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Требуется аттестация</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{dangerCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FileCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function Bell({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
