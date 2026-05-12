export type DemoUser = {
  id: string;
  name: string;
};

export const DEMO_USERS: DemoUser[] = [
  { id: 'user-a', name: 'User A' },
  { id: 'user-b', name: 'User B' },
];

export const isValidDemoUserId = (userId: string): boolean =>
  /^[a-z0-9_-]{3,64}$/.test(userId);

export const isValidDemoUserName = (name: string): boolean =>
  name.trim().length >= 2 && name.trim().length <= 80;

export const getDemoUser = (
  userId: string,
  userName?: string,
): DemoUser | undefined => {
  const id = userId.trim().toLowerCase();
  const existingUser = DEMO_USERS.find((user) => user.id === id);

  if (existingUser) {
    return existingUser;
  }

  if (!isValidDemoUserId(id)) {
    return undefined;
  }

  const name = userName?.trim() || id;
  if (!isValidDemoUserName(name)) {
    return undefined;
  }

  return { id, name };
};
