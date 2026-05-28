export const DEMO_USER = {
  id: -1,
  name: "Ethan",
  email: "demo@nazhalal.com",
  password: "demo123",
  points: 250,
  created_at: "2025-05-01T00:00:00",
};

export function isDemoUser(userId: number) {
  return userId === DEMO_USER.id;
}
