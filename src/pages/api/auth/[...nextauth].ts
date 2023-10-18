import Dayjs from 'dayjs'
import type { AuthOptions, Session } from 'next-auth'
import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { LoginResponse } from '@/common/types'
import axios, { AxiosError } from 'axios'

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
                    const response = await axios.post<LoginResponse>('/api/auth/login', {
                        email: credentials?.email,
                        password: credentials?.password
                    }, {
                        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    return {
                        ...response.data.data,
                        token: response.data.meta.token,
                        store_id: response.data.meta.store_id
                    }
                } catch (e) {
                    const error = e as AxiosError
                    console.error(error.response?.data)
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
