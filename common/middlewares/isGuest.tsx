import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { ComponentType, useEffect, useState } from "react"

const isGuest = (ChildComponent: ComponentType) => () => {
    const [loading, setLoading] = useState<boolean>(true)

    const router = useRouter()
    const session = useSession()

    useEffect(() => {
        if (session.status == 'authenticated') {
            router.push('/redirector')
            return
        }

        if (session.status == 'unauthenticated') {
            setLoading(false)
            return
        }

        setLoading(true)
    }, [session.status])

    if (loading) {
        return <h1>Loading...</h1>
    }

    return <ChildComponent />
}

export default isGuest
