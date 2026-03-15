/**
 * EcoSync Hardcoded Login Credentials
 * Based on backend database structure and sample data
 * 
 * NOTE: This is for demo/development purposes only.
 * In production, use proper authentication with hashed passwords.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  permissions: string[];
  defaultBuilding?: string;
}

export const HARDCODED_USERS: User[] = [
  {
    id: "user_001",
    email: "admin@ecosync.com",
    name: "Admin User",
    role: "administrator",
    company: "EcoSync HQ",
    permissions: ["all"],
    defaultBuilding: "ecosync_tower"
  },
  {
    id: "user_002",
    email: "facilities@ecosync.com",
    name: "Facilities Manager",
    role: "facilities_manager",
    company: "EcoSync HQ",
    permissions: ["view", "control", "alerts"],
    defaultBuilding: "ecosync_tower"
  },
  {
    id: "user_003",
    email: "demo@ecosync.com",
    name: "Demo User",
    role: "viewer",
    company: "EcoSync Demo",
    permissions: ["view"],
    defaultBuilding: "ecosync_tower"
  },
  {
    id: "user_004",
    email: "tech@ecosync.com",
    name: "Technician",
    role: "technician",
    company: "EcoSync Services",
    permissions: ["view", "alerts", "remediate"],
    defaultBuilding: "ecosync_tower"
  }
];

// Hardcoded passwords (in production, these would be hashed)
export const USER_PASSWORDS: Record<string, string> = {
  "admin@ecosync.com": "admin123",
  "facilities@ecosync.com": "facilities123",
  "demo@ecosync.com": "demo123",
  "tech@ecosync.com": "tech123"
};

// Default credentials for quick login
export const DEFAULT_CREDENTIALS = {
  email: "demo@ecosync.com",
  password: "demo123"
};

/**
 * Authenticate user with hardcoded credentials
 */
export function authenticateUser(email: string, password: string): User | null {
  const user = HARDCODED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  
  const storedPassword = USER_PASSWORDS[email.toLowerCase()];
  if (!storedPassword || password !== storedPassword) return null;
  
  return user;
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | null {
  return HARDCODED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
