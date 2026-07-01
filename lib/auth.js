import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!passwordMatch) return null

        let deviceToken = user.deviceToken
        if (user.role !== 'admin') {
          deviceToken = randomUUID()
          await prisma.user.update({
            where: { id: user.id },
            data: { deviceToken },
          })
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          deviceToken,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.deviceToken = user.deviceToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role

        if (token.role !== 'admin') {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { deviceToken: true },
          })

          if (!dbUser || dbUser.deviceToken !== token.deviceToken) {
            session.user = null
            session.expires = new Date(0).toISOString()
            session.error = 'device_conflict'
          }
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}