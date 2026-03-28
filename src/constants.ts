import { Patrol, Incident, DashboardStats, HotspotZone, Criminal } from './types';

export const getMockData = (center: [number, number]) => {
  const [lat, lng] = center;
  
  const patrols: Patrol[] = [
    { 
      id: 'ALPHA-01', 
      officerName: 'Sgt. R. Kumar', 
      startTime: new Date().toISOString(), 
      status: 'On Patrol', 
      location: [lat, lng], 
      zone: 'Zone A-1',
      routePoints: [
        { name: 'Point A', location: [lat + 0.005, lng + 0.005] },
        { name: 'Point B', location: [lat + 0.01, lng + 0.008] },
        { name: 'Point C', location: [lat + 0.008, lng + 0.015] }
      ],
      photos: [],
      attendanceVerified: false
    },
    { 
      id: 'BRAVO-03', 
      officerName: 'Ofc. M. Singh', 
      startTime: new Date().toISOString(), 
      status: 'Responding', 
      location: [lat + 0.002, lng - 0.003], 
      zone: 'Zone B-3',
      routePoints: [
        { name: 'Point D', location: [lat + 0.004, lng - 0.005] },
        { name: 'Point E', location: [lat + 0.006, lng - 0.002] }
      ],
      photos: [],
      attendanceVerified: true
    },
    { 
      id: 'CHARLIE-07', 
      officerName: 'Ofc. A. Sharma', 
      startTime: new Date().toISOString(), 
      status: 'On Patrol', 
      location: [lat - 0.005, lng + 0.002], 
      zone: 'Zone C-7',
      routePoints: [
        { name: 'Point F', location: [lat - 0.008, lng + 0.004] },
        { name: 'Point G', location: [lat - 0.01, lng + 0.001] }
      ],
      photos: [],
      attendanceVerified: false
    },
  ];

  const incidents: Incident[] = [
    { 
      id: 'I-101', 
      title: 'CCTV Requirement: Little Flower School', 
      description: 'ATP II Town - High Population Density. 2 Additional cameras required (Fixed).', 
      location: [lat + 0.005, lng + 0.005], 
      priority: 'High', 
      type: 'Theft', 
      status: 'Open', 
      timestamp: new Date().toISOString(), 
      locationName: 'Little Flower School',
      files: [
        { name: 'site_survey_01.jpg', url: 'https://picsum.photos/seed/school/800/600', type: 'image/jpeg' }
      ]
    },
    { 
      id: 'I-102', 
      title: 'CCTV Requirement: Human Rights Dept', 
      description: 'ATP II Town - Medium Population Density. 2 Additional cameras required.', 
      location: [lat + 0.004, lng - 0.005], 
      priority: 'Medium', 
      type: 'Theft', 
      status: 'In-Progress', 
      timestamp: new Date().toISOString(), 
      locationName: 'Human Rights Department',
      files: []
    },
    { 
      id: 'I-103', 
      title: 'CCTV Requirement: Under Railway Bridge', 
      description: 'Rahmath Nagar - High Population Density. 6 Additional cameras required (4 Night Vision).', 
      location: [lat - 0.008, lng - 0.01], 
      priority: 'Critical', 
      type: 'Assault', 
      status: 'Open', 
      timestamp: new Date().toISOString(), 
      locationName: 'Railway Bridge, Rahmath Nagar',
      files: [
        { name: 'bridge_view.png', url: 'https://picsum.photos/seed/bridge/800/600', type: 'image/png' }
      ]
    },
    { 
      id: 'I-104', 
      title: 'CCTV Requirement: Nagula Katta Circle', 
      description: 'Lakshminagar - High Population Density. 5 Additional cameras required (3 Night Vision).', 
      location: [lat - 0.012, lng + 0.005], 
      priority: 'High', 
      type: 'Vehicle Theft', 
      status: 'Resolved', 
      timestamp: new Date().toISOString(), 
      locationName: 'Nagula Katta Circle',
      files: []
    },
    { 
      id: 'I-105', 
      title: 'CCTV Requirement: Sanjeeva Reddy Bunglow', 
      description: 'Lakshminagar - High Population Density. 5 Additional cameras required (1 PTZ, 1 Night Vision).', 
      location: [lat + 0.008, lng + 0.015], 
      priority: 'High', 
      type: 'Drug Offense', 
      status: 'In-Progress', 
      timestamp: new Date().toISOString(), 
      locationName: 'Sanjeeva Reddy Bunglow Circle',
      files: []
    },
  ];

  const criminals: Criminal[] = [
    {
      id: 'C-001',
      name: 'Vikram Singh',
      alias: 'The Ghost',
      threatLevel: 'Critical',
      lastSeen: 'Zone A-1',
      crimes: ['Grand Theft Auto', 'Armed Robbery'],
      photoUrl: 'https://picsum.photos/seed/criminal1/200/200',
      location: [lat + 0.005, lng + 0.005]
    },
    {
      id: 'C-002',
      name: 'Rahul Verma',
      alias: 'Shadow',
      threatLevel: 'High',
      lastSeen: 'Zone B-3',
      crimes: ['Drug Trafficking', 'Assault'],
      photoUrl: 'https://picsum.photos/seed/criminal2/200/200',
      location: [lat + 0.004, lng - 0.005]
    },
    {
      id: 'C-003',
      name: 'Amit Kumar',
      alias: 'Blade',
      threatLevel: 'Medium',
      lastSeen: 'Zone C-7',
      crimes: ['Burglary', 'Vandalism'],
      photoUrl: 'https://picsum.photos/seed/criminal3/200/200',
      location: [lat + 0.008, lng + 0.015]
    }
  ];

  const hotspots: HotspotZone[] = [
    { id: 'Z-1', name: 'ATP II Town', location: [lat + 0.005, lng + 0.005], score: 92, trend: 'up', createdAt: new Date().toISOString(), description: 'High population density, frequent petty thefts reported.' },
    { id: 'Z-2', name: 'Rahmath Nagar', location: [lat - 0.008, lng - 0.01], score: 88, trend: 'up', createdAt: new Date().toISOString(), description: 'Poor lighting, reported assault cases near the bridge.' },
    { id: 'Z-3', name: 'Lakshminagar', location: [lat - 0.012, lng + 0.005], score: 76, trend: 'down', createdAt: new Date().toISOString(), description: 'Vehicle theft hotspot, currently under surveillance.' },
    { id: 'Z-4', name: 'Revenue Colony', location: [lat + 0.008, lng - 0.008], score: 64, trend: 'stable', createdAt: new Date(Date.now() - 86400000).toISOString(), description: 'Residential area, reported suspicious activities at night.' },
    { id: 'Z-5', name: 'Marthy Nagar', location: [lat - 0.005, lng + 0.012], score: 58, trend: 'up', createdAt: new Date(Date.now() - 172800000).toISOString(), description: 'Emerging hotspot, increasing reports of vandalism.' },
  ];

  return { patrols, incidents, criminals, hotspots };
};

export const MOCK_DATA = getMockData([14.6819, 77.6006]);
export const MOCK_PATROLS: Patrol[] = MOCK_DATA.patrols;
export const MOCK_INCIDENTS: Incident[] = MOCK_DATA.incidents;
export const MOCK_CRIMINALS: Criminal[] = MOCK_DATA.criminals;
export const MOCK_HOTSPOTS: HotspotZone[] = MOCK_DATA.hotspots;

export const MOCK_STATS: DashboardStats = {
  totalIncidents: 15,
  activePatrols: 4,
  criticalHotspots: 2,
  activeRoutes: 1,
};

export const HOTSPOT_ZONES: HotspotZone[] = MOCK_HOTSPOTS;
