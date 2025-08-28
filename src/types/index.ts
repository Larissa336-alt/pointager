export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  department: string;
  position: string;
  avatar?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  type: 'clock-in' | 'clock-out';
  timestamp: Date;
  location?: string;
  notes?: string;
}

export interface WorkSession {
  id: string;
  employeeId: string;
  clockIn: Date;
  clockOut?: Date;
  totalHours?: number;
  date: string;
}

export interface AuthUser {
  employee: Employee;
  isAuthenticated: boolean;
}