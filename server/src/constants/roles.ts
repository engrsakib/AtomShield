export const ROLES = {
  // Platform roles
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER",
};

export type IRoles = (typeof ROLES)[keyof typeof ROLES];
