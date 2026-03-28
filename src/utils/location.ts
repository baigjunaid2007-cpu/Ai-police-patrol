
export const generateNearbyCoords = (center: [number, number], count: number, radius: number = 0.01): [number, number][] => {
  const coords: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * radius * 2;
    const lngOffset = (Math.random() - 0.5) * radius * 2;
    coords.push([center[0] + latOffset, center[1] + lngOffset]);
  }
  return coords;
};

export const getDistance = (p1: [number, number], p2: [number, number]): number => {
  const R = 6371e3; // metres
  const φ1 = p1[0] * Math.PI/180;
  const φ2 = p2[0] * Math.PI/180;
  const Δφ = (p2[0]-p1[0]) * Math.PI/180;
  const Δλ = (p2[1]-p1[1]) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
};
