import type { User, Role } from '@prisma/client';
import prisma from '@@/lib/prisma';
import redis from '@@/lib/redis';

export class UsersQueryBuilder {
  static async findUsers(skip: number, take: number): Promise<Pick<User, 'id' | 'username' | 'name' | 'role'>[]> {
    return prisma.user.findMany({
      skip,
      take,
      select: { id: true, username: true, name: true, role: true }
    });
  }

  static async countUsers(): Promise<number> {
    return prisma.user.count();
  }

  static async findUserById(id: number): Promise<Pick<User, 'id' | 'username' | 'name' | 'role'> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, name: true, role: true }
    });
  }

  static async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  static async createUser(data: { username: string; password: string; name: string; role?: Role }): Promise<Pick<User, 'id' | 'username' | 'name' | 'role'>> {
    const created = await prisma.user.create({ data });
    return { id: created.id, username: created.username, name: created.name, role: created.role };
  }

  static async updateUser(id: number, data: Partial<{ username: string; password: string; name: string; role: Role }>): Promise<Pick<User, 'id' | 'username' | 'name' | 'role'>> {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, name: true, role: true }
    });
    return updated;
  }

  static async deleteUser(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  static async deleteUserSessions(userId: number): Promise<void> {
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: { sessionToken: true }
    });
    if (sessions.length > 0) {
      const keys = sessions.map(s => `session:${s.sessionToken}`);
      await redis.del(keys);
    }
    await prisma.session.deleteMany({ where: { userId } });
  }
}
