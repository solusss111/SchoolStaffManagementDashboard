export type StaffRecord = {
  fullName: string;
  position?: string;
  subject?: string;
  category?: string;
  categoryDate?: string;
  nextAttestation?: string;
  status?: string;
};

const KEY = "school_staff_records_v1";

export function loadStaff(): StaffRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStaff(records: StaffRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}
