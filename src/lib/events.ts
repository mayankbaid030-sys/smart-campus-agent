import { Faculty, AppNotification, Reminder, SupportedLanguage, UserAccount } from '@/types';
import initialFacultyList from '@/data/faculty.json';
import roomsList from '@/data/rooms.json';
import wifiList from '@/data/wifi_access_points.json';

type EventCallback<T = any> = (data: T) => void;

class CampusEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit<T>(event: string, data: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }
}

export const campusEventBus = new CampusEventEmitter();

// Event Names Constants
export const CAMPUS_EVENTS = {
  FACULTY_LOCATION_UPDATED: 'FACULTY_LOCATION_UPDATED',
  NOTIFICATION_TRIGGERED: 'NOTIFICATION_TRIGGERED',
  REMINDER_DUE: 'REMINDER_DUE',
  LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',
  AUTH_STATE_CHANGED: 'AUTH_STATE_CHANGED',
};

// In-Memory Live Faculty State (Simulated live campus state)
let liveFacultyState: Faculty[] = JSON.parse(JSON.stringify(initialFacultyList));
let simulationTimer: NodeJS.Timeout | null = null;

export function getLiveFaculty(): Faculty[] {
  return liveFacultyState;
}

export function updateFacultyStatus(
  facultyId: string,
  newStatus: Faculty['status'],
  newRoomId?: string
): Faculty | null {
  const target = liveFacultyState.find((f) => f.id === facultyId);
  if (!target) return null;

  target.status = newStatus;

  if (newRoomId) {
    const room = roomsList.find((r) => r.id === newRoomId);
    if (room) {
      const wifi = wifiList.find((w) => w.id === room.wifiAp);
      target.currentLocation = {
        roomId: room.id,
        roomName: room.name,
        building: room.building,
        floor: room.floor,
        wifiAp: room.wifiAp,
        lastUpdated: 'Just now',
      };
    }
  } else {
    target.currentLocation.lastUpdated = 'Just now';
  }

  // Notify all subscribed UI components
  campusEventBus.emit(CAMPUS_EVENTS.FACULTY_LOCATION_UPDATED, liveFacultyState);

  // Trigger alert notification
  campusEventBus.emit<AppNotification>(CAMPUS_EVENTS.NOTIFICATION_TRIGGERED, {
    id: `notif-${Date.now()}`,
    title: `Faculty Radar Update`,
    message: `${target.name} is now "${newStatus}" at ${target.currentLocation.roomName}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'info',
    read: false,
  });

  return target;
}

/**
 * Simulate dynamic campus movements (e.g., faculty stepping into lab or cabin)
 */
export function simulateRandomMovement(): void {
  if (liveFacultyState.length === 0) return;
  const randomIndex = Math.floor(Math.random() * liveFacultyState.length);
  const faculty = liveFacultyState[randomIndex];

  const possibleStatuses: Faculty['status'][] = [
    'In Cabin',
    'In Class',
    'In Meeting',
    'In Research Lab',
  ];
  const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];

  // Pick a realistic room based on status
  let candidateRooms = roomsList.filter((r) => {
    if (newStatus === 'In Cabin') return r.type.includes('Cabin');
    if (newStatus === 'In Class') return r.type.includes('Lecture Hall');
    if (newStatus === 'In Research Lab') return r.type.includes('Lab');
    return true;
  });

  if (candidateRooms.length === 0) candidateRooms = roomsList;
  const pickedRoom = candidateRooms[Math.floor(Math.random() * candidateRooms.length)];

  updateFacultyStatus(faculty.id, newStatus, pickedRoom.id);
}

/**
 * Start background simulation loop in browser
 */
export function startCampusSimulator(intervalMs: number = 25000): void {
  if (typeof window === 'undefined') return;
  if (simulationTimer) return;

  simulationTimer = setInterval(() => {
    simulateRandomMovement();
  }, intervalMs);
}

export function stopCampusSimulator(): void {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}
