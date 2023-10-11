import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { ComponentType, useEffect, useState } from "react"
import { UserData, Role } from "@/common/types"

const isUser = (ChildComponent: ComponentType, roles: Role[] = []) => () => {
    const [loading, setLoading] = useState<boolean>(true)

    const router = useRouter()
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            router.push('/auth/login')
            return
        }

        if (roles.length > 0 && session.status == 'authenticated') {
            const user = session.data?.user as UserData
            if (!roles.includes(user.role)) {
                router.push('/redirector')

                return
            }

            setLoading(false)
            return
        }

        if (session.status == 'authenticated') {
            setLoading(false)
        }
    }, [session.status])

    if (loading) {
        return <h1>Loading....</h1>
    }

    return <ChildComponent />
}

export default isUser
