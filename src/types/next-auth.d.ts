import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      clubId: number;
      clubLogo: string;
      clubShortName: string;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    clubId: number;
    clubLogo: string;
    clubShortName: string;
    isAdmin: boolean;
  }
}
