export type PatrolStatus = 'On Patrol' | 'Available' | 'Responding' | 'Off Duty';
export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentType = 'Robbery' | 'Theft' | 'Assault' | 'Vehicle Theft' | 'Drug Offense' | 'Vandalism' | 'Burglary' | 'Investigation';

export interface Patrol {
  id: string;
  officerName: string;
  startTime: string;
  status: PatrolStatus;
  location: [number, number];
  zone: string;
  routePoints: { name: string; location: [number, number] }[];
  photos?: string[];
  attendanceVerified?: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: [number, number];
  priority: IncidentPriority;
  type: IncidentType;
  status: 'Open' | 'Resolved' | 'In-Progress';
  timestamp: string;
  locationName: string;
  files?: { name: string; url: string; type: string }[];
}

export interface HotspotZone {
  id: string;
  name: string;
  location: [number, number];
  score: number;
  trend: 'up' | 'down' | 'stable';
  createdAt: string;
  description: string;
}

export interface Criminal {
  id: string;
  name: string;
  alias: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastSeen: string;
  crimes: string[];
  photoUrl: string;
  location?: [number, number];
}

export interface DashboardStats {
  totalIncidents: number;
  activePatrols: number;
  criticalHotspots: number;
  activeRoutes: number;
}
