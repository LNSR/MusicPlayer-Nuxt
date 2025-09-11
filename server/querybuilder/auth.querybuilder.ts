import type { User, Session } from '@prisma/client';
import prisma from '@@/lib/prisma';

export class AuthQueryBuilder {
  static async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  static async createSessionRecord(sessionToken: string, userId: number, expires: Date, userAgent: string, platform: string = 'web'): Promise<Session> {
    return prisma.session.create({
      data: { sessionToken, userId, expires, userAgent, platform }
    });
  }

  static async findUserById(id: number): Promise<Pick<User, 'id' | 'username' | 'role'> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true }
    });
  }

  static async deleteSessionRecords(sessionToken: string): Promise<{ count: number }> {
    return prisma.session.deleteMany({ where: { sessionToken } });
  }

  static async findSessionByToken(sessionToken: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { sessionToken } });
  }
}
