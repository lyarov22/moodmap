export interface Mood {
  mood: number;
  coords: { lat: number; lng: number };
  ip?: string;
  timestamp?: string;
}

const API_BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || 'http://localhost:8000';

export async function getMoods(): Promise<Mood[]> {
  const response = await fetch(`${API_BASE_URL}/api/moods`);
  if (!response.ok) throw new Error('Failed to fetch moods');
  return response.json();
}

export async function createMood(mood: number, lat: number, lng: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, lat, lng })
  });
  const data = await response.json();
  return { ok: response.ok, ...data };
}


