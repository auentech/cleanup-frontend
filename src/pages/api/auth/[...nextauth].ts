import Dayjs from 'dayjs'
import type { AuthOptions, Session } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { LoginResponse } from '@/common/types'

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
                try {
                    const domain = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`
                    const response = await fetch(domain, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password
                        }),
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
                } catch (e) {
                    console.error(e)
                    throw new Error('Unable to log you in')
                }
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

                return token
            }

            return params.token
        },
    },
}

export default NextAuth(authOptions)
