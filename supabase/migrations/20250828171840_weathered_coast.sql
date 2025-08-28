/*
  # Create employees and time tracking tables

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text, employee/manager)
      - `department` (text)
      - `position` (text)
      - `avatar_url` (text, optional)
      - `face_encoding` (text, optional for face recognition)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `time_entries`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `type` (text, clock-in/clock-out)
      - `timestamp` (timestamp)
      - `location` (text, optional)
      - `latitude` (decimal, optional)
      - `longitude` (decimal, optional)
      - `notes` (text, optional)
      - `face_verified` (boolean, default false)
      - `created_at` (timestamp)

    - `notifications`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `title` (text)
      - `message` (text)
      - `type` (text, info/warning/success/error)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('employee', 'manager')),
  department text NOT NULL,
  position text NOT NULL,
  avatar_url text,
  face_encoding text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('clock-in', 'clock-out')),
  timestamp timestamptz DEFAULT now(),
  location text,
  latitude decimal,
  longitude decimal,
  notes text,
  face_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for employees table
CREATE POLICY "Employees can read own data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM employees WHERE id::text = auth.uid()::text AND role = 'manager'
  ));

CREATE POLICY "Managers can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees WHERE id::text = auth.uid()::text AND role = 'manager'
  ));

-- Policies for time_entries table
CREATE POLICY "Employees can read own time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (employee_id::text = auth.uid()::text OR EXISTS (
    SELECT 1 FROM employees WHERE id::text = auth.uid()::text AND role = 'manager'
  ));

CREATE POLICY "Employees can insert own time entries"
  ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id::text = auth.uid()::text);

-- Policies for notifications table
CREATE POLICY "Employees can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (employee_id::text = auth.uid()::text);

CREATE POLICY "Managers can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM employees WHERE id::text = auth.uid()::text AND role = 'manager'
  ));

-- Insert  data
INSERT INTO employees (id, name, email, role, department, position, avatar_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@company.com', 'manager', 'IT', 'Chef de Projet', 'https://images.unsplash.com/photo-1494790108755-2616b5db2b24?w=150&h=150&fit=crop&crop=face');
  ('550e8400-e29b-41d4-a716-446655440002', 'Bob Martin', 'bob@company.com', 'employee', 'IT', 'Développeur Frontend', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Claire Dubois', 'claire@company.com', 'employee', 'Design', 'UI/UX Designer', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
  ('550e8400-e29b-41d4-a716-446655440004', 'David Wilson', 'david@company.com', 'employee', 'IT', 'Développeur Backend', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');