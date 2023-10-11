import axios from 'axios'
import { useSession } from 'next-auth/react'

const useAxios = () => {
    const session = useSession()

    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            //@ts-ignore
            'Authorization': 'Bearer ' + session.data?.user.token
        },
        withCredentials: true
    })

    return instance
}

export default useAxios
