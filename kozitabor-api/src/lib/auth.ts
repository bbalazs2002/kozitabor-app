import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import Credentials from "@auth/express/providers/credentials";
import bcrypt from "bcrypt"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (
          !credentials?.email || !credentials?.password ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        // ⚠️ csak azt add vissza, amit sessionbe akarsz
        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/admin/login" },
  secret: process.env.AUTH_SECRET,
  basePath: "/api/auth",
  trustHost: true
};