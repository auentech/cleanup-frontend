import { signOut } from "next-auth/react"

const Logout = () => {
    const handleLogout = async () => {
        await signOut({ redirect: true })
    }

    return <a onClick={handleLogout}>
        - Logout
    </a>
}

export default Logout
