import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveStaff, StaffRecord } from "../data/staffStore";

function normalizeKey(s: string) {
  return String(s || "").trim().toLowerCase();
}

function pick(row: Record<string, any>, candidates: string[]) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const found = keys.find((k) => normalizeKey(k).includes(normalizeKey(c)));
    if (found) return row[found];
  }
  return "";
}

function toStr(v: any) {
  if (v == null) return "";
  return String(v).trim();
}

/**
 * Пробуем “угадать” колонки твоего Excel:
 * - ФИО / Тегі / Аты / Әкесінің аты
 * - Должность (қызметі / должность)
 * - Предмет (пәні / предмет)
 * - Категория (санаты / категория)
 * - Дата присвоения (дата присвоения / берілген күні)
 * - Следующая аттестация (следующая / аттестация)
 */
function mapRowsToStaff(rows: Record<string, any>[]): StaffRecord[] {
  return rows
    .map((r) => {
      const fio =
        toStr(pick(r, ["ФИО"])) ||
        [
          toStr(pick(r, ["Тегі"])),
          toStr(pick(r, ["Аты"])),
          toStr(pick(r, ["Әкес"])), // Әкесінің аты
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      const position = toStr(pick(r, ["Должность", "Қызмет", "Лауазым"]));
      const subject = toStr(pick(r, ["Предмет", "Пән"]));
      const category = toStr(pick(r, ["Категория", "Санат"]));

      const categoryDate = toStr(
        pick(r, ["Дата присвоения", "Присвоения", "Берілген күні", "күні"])
      );

      // В твоих таблицах часто есть годы 2026/2027/...
      // “Следующая аттестация” можно вычислить как ближайший год, где ячейка не пустая.
      const nextAtt = (() => {
        const yearKeys = Object.keys(r).filter((k) => /^\d{4}$/.test(String(k).trim()));
        const years = yearKeys.map((k) => Number(String(k).trim())).filter((n) => n >= 2020 && n <= 2050).sort((a,b)=>a-b);
        for (const y of years) {
          const val = r[String(y)];
          if (val !== null && val !== undefined && String(val).trim() !== "") return String(y);
        }
        return "";
      })();

      if (!fio) return null;

      const rec: StaffRecord = {
        fullName: fio,
        position: position || undefined,
        subject: subject || undefined,
        category: category || undefined,
        categoryDate: categoryDate || undefined,
        nextAttestation: nextAtt || undefined,
        status: undefined,
      };
      return rec;
    })
    .filter(Boolean) as StaffRecord[];
}

export default function ImportExcelPage() {
  const [fileName, setFileName] = useState<string>("");
  const [wb, setWb] = useState<XLSX.WorkBook | null>(null);
  const [sheetName, setSheetName] = useState<string>("");
  const [preview, setPreview] = useState<StaffRecord[]>([]);
  const [rawCount, setRawCount] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);

  const sheetNames = useMemo(() => wb?.SheetNames ?? [], [wb]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSaved(false);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    setWb(workbook);

    // Автовыбор листа: если есть "1 сентябрь тариф", иначе первый
    const preferred =
      workbook.SheetNames.find((n) => normalizeKey(n).includes("1 сентябрь")) ??
      workbook.SheetNames[0] ??
      "";

    setSheetName(preferred);

    // Сразу построим предпросмотр
    buildPreview(workbook, preferred);
  }

  function buildPreview(workbook: XLSX.WorkBook, name: string) {
    if (!name) return;

    const ws = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
      defval: "",
    });

    setRawCount(rows.length);

    const mapped = mapRowsToStaff(rows);
    setPreview(mapped.slice(0, 15)); // показываем первые 15
  }

  function onSheetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value;
    setSheetName(name);
    if (wb) buildPreview(wb, name);
  }

  function onSave() {
    if (!wb || !sheetName) return;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
    const mapped = mapRowsToStaff(rows);

    saveStaff(mapped);
    setSaved(true);
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Импорт Excel</h2>
          <p className="text-gray-600 mt-1">
            Загрузите файл .xlsx, выберите лист и сохраните сотрудников.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            className="block"
          />

          {fileName && (
            <div className="text-sm text-gray-700">
              Файл: <span className="font-medium">{fileName}</span>
            </div>
          )}

          {sheetNames.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Лист:</span>
              <select
                value={sheetName}
                onChange={onSheetChange}
                className="border border-border rounded-md px-3 py-2 text-sm"
              >
                {sheetNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onSave}
            disabled={!wb || !sheetName}
            className="ml-auto px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
          >
            Сохранить сотрудников
          </button>
        </div>

        {wb && (
          <div className="text-sm text-gray-700">
            Строк в листе: <span className="font-medium">{rawCount}</span> •
            Распознано сотрудников:{" "}
            <span className="font-medium">{preview.length}</span>{" "}
            (показываем первые 15)
          </div>
        )}

        {saved && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            ✅ Сохранено в браузере (localStorage). Откройте вкладку «Сотрудники»
            и подключим отображение из сохранённых данных.
          </div>
        )}

        {preview.length > 0 && (
          <div className="overflow-auto border border-border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">ФИО</th>
                  <th className="text-left px-4 py-3">Должность</th>
                  <th className="text-left px-4 py-3">Предмет</th>
                  <th className="text-left px-4 py-3">Категория</th>
                  <th className="text-left px-4 py-3">След. аттестация</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{r.fullName}</td>
                    <td className="px-4 py-3">{r.position ?? "-"}</td>
                    <td className="px-4 py-3">{r.subject ?? "-"}</td>
                    <td className="px-4 py-3">{r.category ?? "-"}</td>
                    <td className="px-4 py-3">{r.nextAttestation ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!preview.length && wb && (
          <div className="text-gray-600">
            Не получилось распознать строки. Возможно, в листе нестандартные
            названия колонок — скажешь названия колонок, я подстрою маппинг.
          </div>
        )}
      </div>
    </div>
  );
}
