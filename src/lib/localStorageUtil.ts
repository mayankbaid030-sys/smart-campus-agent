import { UserAccount, UserRole, SupportedLanguage, Reminder } from '@/types';
import studentsData from '@/data/students.json';
import facultyData from '@/data/faculty.json';

const STORAGE_PREFIX = 'snpu_account_';
const ACTIVE_PHONE_KEY = 'snpu_active_phone';

// In-memory fallback if localStorage is disabled or throws QuotaExceededError
const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn(`[Storage] Failed to read "${key}" from localStorage:`, err);
  }
  return memoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`[Storage] Failed to write "${key}" to localStorage:`, err);
  }
  memoryStore[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[Storage] Failed to remove "${key}" from localStorage:`, err);
  }
  delete memoryStore[key];
}

/**
 * Standardize phone number format for indexing (+91 followed by 10 digits without spaces)
 */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return rawPhone.trim();
}

/**
 * Format phone for display e.g. +91 98451 23456
 */
export function formatPhoneDisplay(rawPhone: string): string {
  const normalized = normalizePhone(rawPhone);
  const match = normalized.match(/^\+91(\d{5})(\d{5})$/);
  if (match) {
    return `+91 ${match[1]} ${match[2]}`;
  }
  return rawPhone;
}

/**
 * Resolve role and profile details ONLY from college seed records
 */
export function resolveRoleFromSeed(phoneNumber: string): {
  role: UserRole;
  name: string;
  linkedEntityId?: string;
  details?: any;
} {
  const normalized = normalizePhone(phoneNumber);

  // 1. Check Faculty records
  const faculty = (facultyData as any[]).find(
    (f) => normalizePhone(f.phone) === normalized
  );
  if (faculty) {
    return {
      role: 'faculty',
      name: faculty.name,
      linkedEntityId: faculty.id,
      details: faculty,
    };
  }

  // 2. Check Student records
  const student = (studentsData as any[]).find(
    (s) => normalizePhone(s.phone) === normalized
  );
  if (student) {
    return {
      role: 'student',
      name: student.name,
      linkedEntityId: student.id,
      details: student,
    };
  }

  // 3. Check Parent records (matched by parentPhone in students.json)
  const studentWithParent = (studentsData as any[]).find(
    (s) => normalizePhone(s.parentPhone) === normalized
  );
  if (studentWithParent) {
    return {
      role: 'parent',
      name: studentWithParent.parentName || 'Parent / Guardian',
      linkedEntityId: studentWithParent.id,
      details: {
        ward: studentWithParent,
        relation: studentWithParent.parentRelation || 'Parent',
      },
    };
  }

  // 4. Default: Guest / Visitor (never student/faculty unless present in college records)
  return {
    role: 'guest',
    name: 'Campus Visitor',
    details: {
      visitorType: 'Prospective Student / Campus Guest',
      registeredAt: new Date().toISOString(),
    },
  };
}

/**
 * Get default account for a given phone number
 */
function createDefaultAccount(phoneNumber: string): UserAccount {
  const resolved = resolveRoleFromSeed(phoneNumber);

  return {
    phoneNumber: normalizePhone(phoneNumber),
    role: resolved.role,
    name: resolved.name,
    language: 'en',
    linkedEntityId: resolved.linkedEntityId,
    details: resolved.details,
    settings: {
      voiceEnabled: true,
      autoSpeak: true,
      speechRate: 1.0,
      theme: 'light',
      highContrast: false,
      notificationsEnabled: true,
    },
    reminders: [
      {
        id: 'rem-sample-1',
        title: 'Check timetable & live classroom updates',
        datetime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
        category: 'class',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ],
    savedNotes: [],
    lastActive: new Date().toISOString(),
  };
}

/**
 * Load user account by phone number with safe fallback
 */
export function getAccountByPhone(phoneNumber: string): UserAccount {
  const normalized = normalizePhone(phoneNumber);
  const key = `${STORAGE_PREFIX}${normalized}`;

  try {
    const raw = safeGetItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as UserAccount;
      // Re-verify role strictly from college records to ensure policy enforcement
      const resolved = resolveRoleFromSeed(normalized);
      parsed.role = resolved.role;
      parsed.details = resolved.details;
      if (!parsed.reminders) parsed.reminders = [];
      if (!parsed.settings) {
        parsed.settings = {
          voiceEnabled: true,
          autoSpeak: true,
          speechRate: 1.0,
          theme: 'light',
          highContrast: false,
          notificationsEnabled: true,
        };
      }
      return parsed;
    }
  } catch (err) {
    console.error(`[Storage] Corrupt account data for ${normalized}, resetting to safe defaults:`, err);
  }

  const newAccount = createDefaultAccount(normalized);
  saveAccount(newAccount);
  return newAccount;
}

/**
 * Save account by phone number
 */
export function saveAccount(account: UserAccount): void {
  const normalized = normalizePhone(account.phoneNumber);
  const key = `${STORAGE_PREFIX}${normalized}`;
  account.lastActive = new Date().toISOString();
  try {
    safeSetItem(key, JSON.stringify(account));
  } catch (err) {
    console.error(`[Storage] Failed to save account for ${normalized}:`, err);
  }
}

/**
 * Get active session phone number
 */
export function getActiveSessionPhone(): string | null {
  return safeGetItem(ACTIVE_PHONE_KEY);
}

/**
 * Set active session phone number
 */
export function setActiveSessionPhone(phoneNumber: string | null): void {
  if (phoneNumber) {
    safeSetItem(ACTIVE_PHONE_KEY, normalizePhone(phoneNumber));
  } else {
    safeRemoveItem(ACTIVE_PHONE_KEY);
  }
}

/**
 * Update language for an account
 */
export function updateAccountLanguage(phoneNumber: string, language: SupportedLanguage): UserAccount {
  const account = getAccountByPhone(phoneNumber);
  account.language = language;
  saveAccount(account);
  return account;
}

/**
 * Add a reminder to account
 */
export function addAccountReminder(phoneNumber: string, reminder: Omit<Reminder, 'id' | 'createdAt'>): UserAccount {
  const account = getAccountByPhone(phoneNumber);
  const newReminder: Reminder = {
    ...reminder,
    id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  account.reminders = [newReminder, ...(account.reminders || [])];
  saveAccount(account);
  return account;
}

/**
 * Toggle reminder completion
 */
export function toggleReminderStatus(phoneNumber: string, reminderId: string): UserAccount {
  const account = getAccountByPhone(phoneNumber);
  account.reminders = account.reminders.map((r) =>
    r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
  );
  saveAccount(account);
  return account;
}

/**
 * Delete a reminder
 */
export function deleteAccountReminder(phoneNumber: string, reminderId: string): UserAccount {
  const account = getAccountByPhone(phoneNumber);
  account.reminders = account.reminders.filter((r) => r.id !== reminderId);
  saveAccount(account);
  return account;
}
