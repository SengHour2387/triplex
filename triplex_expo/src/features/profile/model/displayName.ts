import type { User } from '../../../core/api/schemas';

/** What to call the user: their name when they set one, otherwise their @username. */
export function displayName(user: Pick<User, 'name' | 'username'>): string {
  const name = user.name?.trim();
  return name ? name : user.username;
}
