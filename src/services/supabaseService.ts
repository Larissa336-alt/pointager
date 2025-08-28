import { supabase } from '../lib/supabase';
import { Employee, TimeEntry } from '../types';
import toast from 'react-hot-toast';

export class SupabaseService {
  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return data.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department,
        position: emp.position,
        avatar: emp.avatar_url,
        faceEncoding: emp.face_encoding,
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Erreur lors du chargement des employés');
      return [];
    }
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          position: employee.position,
          avatar_url: employee.avatar,
          face_encoding: employee.faceEncoding,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Employé créé avec succès');
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        position: data.position,
        avatar: data.avatar_url,
        faceEncoding: data.face_encoding,
      };
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Erreur lors de la création de l\'employé');
      return null;
    }
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          department: updates.department,
          position: updates.position,
          avatar_url: updates.avatar,
          face_encoding: updates.faceEncoding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Employé mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Erreur lors de la mise à jour de l\'employé');
      return false;
    }
  }

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Employé supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Erreur lors de la suppression de l\'employé');
      return false;
    }
  }

  // Time tracking methods
  async clockIn(employeeId: string, location?: string, latitude?: number, longitude?: number, faceVerified = false): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: employeeId,
          type: 'clock-in',
          location,
          latitude,
          longitude,
          face_verified: faceVerified,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await this.createNotification(employeeId, 'Pointage d\'entrée', 'Vous avez pointé votre entrée avec succès', 'success');

      toast.success('Pointage d\'entrée enregistré');
      return {
        id: data.id,
        employeeId: data.employee_id,
        type: data.type,
        timestamp: new Date(data.timestamp),
        location: data.location,
        notes: data.notes,
      };
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error('Erreur lors du pointage d\'entrée');
      return null;
    }
  }

  async clockOut(employeeId: string, location?: string, latitude?: number, longitude?: number, notes?: string, faceVerified = false): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: employeeId,
          type: 'clock-out',
          location,
          latitude,
          longitude,
          notes,
          face_verified: faceVerified,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await this.createNotification(employeeId, 'Pointage de sortie', 'Vous avez pointé votre sortie avec succès', 'success');

      toast.success('Pointage de sortie enregistré');
      return {
        id: data.id,
        employeeId: data.employee_id,
        type: data.type,
        timestamp: new Date(data.timestamp),
        location: data.location,
        notes: data.notes,
      };
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error('Erreur lors du pointage de sortie');
      return null;
    }
  }

  async getTimeEntries(employeeId?: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(entry => ({
        id: entry.id,
        employeeId: entry.employee_id,
        type: entry.type,
        timestamp: new Date(entry.timestamp),
        location: entry.location,
        notes: entry.notes,
      }));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  }

  // Notification methods
  async createNotification(employeeId: string, title: string, message: string, type: 'info' | 'warning' | 'success' | 'error'): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          employee_id: employeeId,
          title,
          message,
          type,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  async getNotifications(employeeId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Analytics methods
  async getAnalytics(employeeId?: string, startDate?: Date, endDate?: Date) {
    try {
      const entries = await this.getTimeEntries(employeeId, startDate, endDate);
      
      // Calculate work sessions
      const sessions = this.calculateWorkSessions(entries);
      
      // Calculate statistics
      const totalHours = sessions.reduce((sum, session) => sum + (session.totalHours || 0), 0);
      const averageHours = sessions.length > 0 ? totalHours / sessions.length : 0;
      const totalDays = sessions.length;
      
      // Group by date for charts
      const dailyHours = sessions.reduce((acc, session) => {
        const date = session.date;
        acc[date] = (acc[date] || 0) + (session.totalHours || 0);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalHours,
        averageHours,
        totalDays,
        dailyHours,
        sessions,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        totalHours: 0,
        averageHours: 0,
        totalDays: 0,
        dailyHours: {},
        sessions: [],
      };
    }
  }

  private calculateWorkSessions(entries: TimeEntry[]) {
    const sessions: any[] = [];
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
}

export const supabaseService = new SupabaseService();

