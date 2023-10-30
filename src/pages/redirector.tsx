import isUser from "@/common/middlewares/isUser"
import { UserData } from "@/common/types"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Redirector = () => {
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData

    useEffect(() => {
        if (user.role == 'admin') {
            router.push('/admin')
        }

        if (user.role == 'manager') {
            router.push('/manager')
        }

        if (user.role == 'operator') {
            router.push('/operator')
        }

        if (user.role == 'washer') {
            router.push('/washer')
        }

        if (user.role == 'packer') {
            router.push('/packer')
        }

        if (user.role == 'ironer') {
            router.push('/ironer')
        }
    }, [user.role])

    return <h1>Redirecting you...</h1>
}

export default isUser(Redirector)
