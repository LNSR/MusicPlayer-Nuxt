import { getCookie } from 'h3'
import type { H3Event } from 'h3'
import { prisma } from '~/lib/prisma'
import type { Role } from '~/lib/prisma'
import redis from '~/lib/redis'

export class UserService {
    
    async getAllUsers() {
        return prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true },
            orderBy: { id: 'asc' }
        })
    }

    async getUserById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true }
        })
    }

    async createUser(data: { email: string, password: string, name?: string, role?: Role }) {
        return prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role || 'VISITOR'
            },
            select: { id: true, name: true, email: true, role: true }
        })
    }

    async updateUser(id: number, data: { name?: string, email?: string, role?: Role, password?: string }) {
        const updateData: { name?: string, email?: string, role?: Role, password?: string } = { ...data }
        return prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        })
    }

    async updateUserRole(id: number, role: 'SUPERADMIN' | 'ADMIN' | 'VISITOR') {
        return prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        })
    }

    async deleteUser(id: number) {
        return prisma.user.delete({
            where: { id }
        })
    }
}

export class UserSessionService {
    async getSessionUser(event: H3Event) {
        const sessionId = getCookie(event, 'session_id')
        if (!sessionId) return null

        const session = await redis.get(`session:${sessionId}`)
        if (!session) return null

        const { userId } = JSON.parse(session)
        return prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true }
        })
    }
}