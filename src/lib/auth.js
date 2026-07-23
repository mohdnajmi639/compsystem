import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import User from '../models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        if (user.role === 'staff' && !user.isApproved) {
          throw new Error('Akaun anda sedang menunggu kelulusan pentadbir (Admin).');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          program: user.program,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 1. On initial login, user object is provided
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.studentId = user.studentId;
        token.program = user.program;
      }

      // 2. Always fetch latest data from DB to keep session instantly synced
      if (token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select('name role department');
          if (dbUser) {
            token.name = dbUser.name;
            token.role = dbUser.role;
            token.department = dbUser.department;
          }
        } catch (error) {
          console.error('Error fetching latest user data in jwt callback:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.department = token.department;
      session.user.studentId = token.studentId;
      session.user.program = token.program;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
