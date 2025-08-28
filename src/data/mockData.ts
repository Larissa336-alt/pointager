import { Employee, TimeEntry, WorkSession } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    role: 'manager',
    department: 'IT',
    position: 'Chef de Projet',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b5db2b24?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Bob Martin',
    email: 'bob@company.com',
    role: 'employee',
    department: 'IT',
    position: 'Développeur Frontend',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Claire Dubois',
    email: 'claire@company.com',
    role: 'employee',
    department: 'Design',
    position: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@company.com',
    role: 'employee',
    department: 'IT',
    position: 'Développeur Backend',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
];

// Generate mock time entries for the last 30 days
export const generateMockTimeEntries = (): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  const now = new Date();
  
  mockEmployees.forEach(employee => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Clock in (8-9 AM)
      const clockIn = new Date(date);
      clockIn.setHours(8 + Math.random(), Math.random() * 60, 0, 0);
      
      entries.push({
        id: `${employee.id}-${i}-in`,
        employeeId: employee.id,
        type: 'clock-in',
        timestamp: clockIn,
        location: 'Bureau Principal'
      });
      
      // Clock out (17-18 PM), 80% chance
      if (Math.random() > 0.2) {
        const clockOut = new Date(date);
        clockOut.setHours(17 + Math.random(), Math.random() * 60, 0, 0);
        
        entries.push({
          id: `${employee.id}-${i}-out`,
          employeeId: employee.id,
          type: 'clock-out',
          timestamp: clockOut,
          location: 'Bureau Principal'
        });
      }
    }
  });
  
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const mockTimeEntries = generateMockTimeEntries();