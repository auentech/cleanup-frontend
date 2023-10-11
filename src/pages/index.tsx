import { useRouter } from "next/router"
import { useEffect } from "react"

const Home = () => {
    const router = useRouter()

    useEffect(() => {
        router.push('/redirector')
    }, [])

    return <h1>Loading...</h1>
}

export default Home
