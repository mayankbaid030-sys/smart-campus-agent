export type UserRole = 'student' | 'faculty' | 'parent' | 'guest';

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'te' | 'ta' | 'ml';

export interface UserAccount {
  phoneNumber: string;
  role: UserRole;
  name: string;
  email?: string;
  language: SupportedLanguage;
  linkedEntityId?: string; // studentId or facultyId
  details?: any; // linked student/faculty/parent record
  settings: {
    voiceEnabled: boolean;
    autoSpeak: boolean;
    speechRate: number;
    theme: 'light' | 'dark' | 'system';
    highContrast: boolean;
    notificationsEnabled: boolean;
  };
  reminders: Reminder[];
  savedNotes: string[];
  lastActive: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  datetime: string; // ISO string or time format
  category: 'class' | 'exam' | 'assignment' | 'bus' | 'event' | 'personal';
  isCompleted: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  actionUrl?: string;
}

export interface Student {
  id: string;
  usn: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  deptCode: string;
  year: number;
  semester: number;
  section: string;
  cgpa: number;
  mentorName: string;
  mentorPhone: string;
  parentName: string;
  parentPhone: string;
  parentRelation: string;
  busRoute: number;
  hostelResident: boolean;
  enrolledCourses: { code: string; title: string; credits: number }[];
}

export interface FacultyLocation {
  roomId: string;
  roomName: string;
  building: string;
  floor: string;
  wifiAp: string;
  lastUpdated: string;
}

export interface FacultyScheduleItem {
  time: string;
  activity: string;
  room: string;
}

export interface Faculty {
  id: string;
  name: string;
  phone: string;
  email: string;
  designation: string;
  department: string;
  deptCode: string;
  cabin: string;
  officeHours: string;
  status: 'In Cabin' | 'In Class' | 'In Meeting' | 'In Research Lab' | 'Off Campus' | 'On Leave';
  currentLocation: FacultyLocation;
  subjectsTaught: { code: string; name: string }[];
  scheduleToday: FacultyScheduleItem[];
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  type: string;
  capacity: number;
  hasProjector: boolean;
  wifiAp: string;
}

export interface WiFiAccessPoint {
  id: string;
  mac: string;
  ssid: string;
  building: string;
  floor: string;
  zone: string;
  signalStrengthDbm: number;
  nearbyRooms: string[];
}

export interface CampusEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  registrationLink: string;
  status: string;
}

export interface CampusHoliday {
  id: string;
  date: string;
  name: string;
  type: string;
  description: string;
}

export interface StudyNote {
  id: string;
  courseCode: string;
  courseTitle: string;
  module: string;
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  tags: string[];
  downloadUrl: string;
  summary: string;
}

export interface SubjectAttendance {
  courseCode: string;
  courseName: string;
  faculty: string;
  classesHeld: number;
  classesAttended: number;
  percentage: number;
  status: string;
}

export interface StudentAttendance {
  studentId: string;
  usn: string;
  overallPercentage: number;
  lastUpdated: string;
  subjects: SubjectAttendance[];
}

export interface BusStop {
  stopName: string;
  morningTime: string;
}

export interface BusRoute {
  routeNumber: number;
  routeName: string;
  busPlateNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  morningDeparture: string;
  eveningDeparture: string;
  stops: BusStop[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  language?: SupportedLanguage;
  suggestedActions?: string[];
  metadata?: any;
}
