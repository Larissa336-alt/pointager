import { TimeEntry, WorkSession, Employee } from '../types';
import { mockTimeEntries, mockEmployees } from '../data/mockData';

class TimeTrackingService {
  private timeEntries: TimeEntry[] = [...mockTimeEntries];
  private storageKey = 'timeEntries';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const entries = JSON.parse(stored);
      this.timeEntries = entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.timeEntries));
  }

  async clockIn(employeeId: string, location?: string): Promise<TimeEntry> {
    const entry: TimeEntry = {
      id: `${employeeId}-${Date.now()}-in`,
      employeeId,
      type: 'clock-in',
      timestamp: new Date(),
      location
    };

    this.timeEntries.unshift(entry);
    this.saveToStorage();
    return entry;
  }

  async clockOut(employeeId: string, location?: string, notes?: string): Promise<TimeEntry> {
    const entry: TimeEntry = {
      id: `${employeeId}-${Date.now()}-out`,
      employeeId,
      type: 'clock-out',
      timestamp: new Date(),
      location,
      notes
    };

    this.timeEntries.unshift(entry);
    this.saveToStorage();
    return entry;
  }

  async getTimeEntries(employeeId?: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    let entries = [...this.timeEntries];

    if (employeeId) {
      entries = entries.filter(entry => entry.employeeId === employeeId);
    }

    if (startDate) {
      entries = entries.filter(entry => entry.timestamp >= startDate);
    }

    if (endDate) {
      entries = entries.filter(entry => entry.timestamp <= endDate);
    }

    return entries;
  }

  async getWorkSessions(employeeId?: string, startDate?: Date, endDate?: Date): Promise<WorkSession[]> {
    const entries = await this.getTimeEntries(employeeId, startDate, endDate);
    const sessions: WorkSession[] = [];
    
    // Group entries by employee and date
    const groupedEntries = new Map<string, Map<string, TimeEntry[]>>();
    
    entries.forEach(entry => {
      const dateKey = entry.timestamp.toDateString();
      if (!groupedEntries.has(entry.employeeId)) {
        groupedEntries.set(entry.employeeId, new Map());
      }
      if (!groupedEntries.get(entry.employeeId)!.has(dateKey)) {
        groupedEntries.get(entry.employeeId)!.set(dateKey, []);
      }
      groupedEntries.get(entry.employeeId)!.get(dateKey)!.push(entry);
    });

    // Create work sessions
    groupedEntries.forEach((employeeDays, empId) => {
      employeeDays.forEach((dayEntries, dateKey) => {
        const clockIns = dayEntries.filter(e => e.type === 'clock-in');
        const clockOuts = dayEntries.filter(e => e.type === 'clock-out');
        
        clockIns.forEach(clockIn => {
          const matchingClockOut = clockOuts.find(out => out.timestamp > clockIn.timestamp);
          const totalHours = matchingClockOut 
            ? (matchingClockOut.timestamp.getTime() - clockIn.timestamp.getTime()) / (1000 * 60 * 60)
            : undefined;

          sessions.push({
            id: `${empId}-${clockIn.timestamp.getTime()}`,
            employeeId: empId,
            clockIn: clockIn.timestamp,
            clockOut: matchingClockOut?.timestamp,
            totalHours,
            date: dateKey
          });
        });
      });
    });

    return sessions.sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime());
  }

  async getCurrentStatus(employeeId: string): Promise<'clocked-in' | 'clocked-out'> {
    const todayEntries = await this.getTimeEntries(
      employeeId, 
      new Date(new Date().setHours(0, 0, 0, 0)),
      new Date(new Date().setHours(23, 59, 59, 999))
    );

    if (todayEntries.length === 0) return 'clocked-out';

    const lastEntry = todayEntries[0];
    return lastEntry.type === 'clock-in' ? 'clocked-in' : 'clocked-out';
  }

  async getTodayHours(employeeId: string): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const sessions = await this.getWorkSessions(employeeId, startOfDay, endOfDay);
    return sessions.reduce((total, session) => total + (session.totalHours || 0), 0);
  }
}

export const timeTrackingService = new TimeTrackingService();