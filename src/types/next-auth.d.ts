import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "PARENT" | "CHILD";
      familyId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "PARENT" | "CHILD";
    familyId?: string | null;
  }
}
