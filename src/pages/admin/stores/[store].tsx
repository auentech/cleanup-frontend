import isUser from "@/common/middlewares/isUser"
import { useRouter } from "next/router"

const ShowStore = () => {
    const router = useRouter()

    return <h1>Store: {router.query.store}</h1>
}

export default isUser(ShowStore, ['admin'])
