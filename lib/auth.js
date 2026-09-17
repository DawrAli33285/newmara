import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'User',
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
          accountType: 'user',
        }
      },
    }),
    CredentialsProvider({
      id: 'business-credentials',
      name: 'Business',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const business = await prisma.business.findUnique({
          where: { email: credentials.email },
        })

        if (!business) return null

        const passwordMatch = await bcrypt.compare(credentials.password, business.passwordHash)
        if (!passwordMatch) return null

        return {
          id: business.id,
          email: business.email,
          role: 'business',
          businessName: business.businessName,
          accountType: 'business',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accountType = user.accountType
        token.deviceToken = user.deviceToken
        token.businessName = user.businessName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.accountType = token.accountType
        session.user.businessName = token.businessName

        if (token.accountType === 'user' && token.role !== 'admin') {
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
  secret: process.env.NEXTAUTH_SECRET || "DSDSDSDSDS",
}