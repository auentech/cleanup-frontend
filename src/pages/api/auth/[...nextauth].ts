import Dayjs from 'dayjs'
import type { AuthOptions, Profile, Session, User } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'

type Geography = {
    id: number
    name: string
    created_at: Date
    updated_at: Date
}

type UserProfile = {
    id: number
    address: string
    pincode: number
    aadhaar?: number
    emergency_contact?: number
    state: Geography
    district: Geography
    created_at: Date
    updated_at: Date
}

type UserData = {
    id: string
    name: string
    email: string
    phone: number
    role: 'admin' | 'operator' | 'washer' | 'ironer' | 'packer'
    profile?: UserProfile
    created_at: Date
    updated_at: Date
}

type LoginResponse = {
    data: UserData
    meta: {
        token: string
    }
}

const dayjs = Dayjs()

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            authorize: async credentials => {
                const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const data: LoginResponse = await response.json()
                if (response.ok && data) {
                    return {
                        ...data.data,
                        token: data.meta.token
                    }
                }

                throw new Error('Invalid credentials')
            },
        }),
    ],
    callbacks: {
        session: async (params) => {
            const token = params.token
            const session: Session = {
                user: {
                    ...token
                },
                expires: dayjs.add(1, 'day').toISOString()
            }

            return session
        },
        jwt(params) {
            if (params.user) {
                const token = {
                    ...params.token,
                    ...params.user
                }

                return token;
            }

            return params.token
        },
    },
}

export default NextAuth(authOptions)
