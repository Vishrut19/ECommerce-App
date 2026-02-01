import type { auth } from "./lib/auth";

type Session = typeof auth.$Infer.Session;

declare module "better-auth/types" {
  interface Session {
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
      role: string;
    };
  }
}
