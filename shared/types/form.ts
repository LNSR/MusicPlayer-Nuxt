export type UserForm = {
    id: number
    username: string
    name: string
    role: Role
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}