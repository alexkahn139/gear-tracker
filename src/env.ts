/**
 * Hono environment map.
 *
 * Every route in the app is created as `new Hono<AppEnv>()`, so
 * `c.get('user')`, `c.get('userId')`, `c.set(...)` are all type-checked
 * against this single definition.
 */
export type AppEnv = {
  Variables: {
    // Set by requireAuth() after a successful session lookup.
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
    userId: number;
  };
};
