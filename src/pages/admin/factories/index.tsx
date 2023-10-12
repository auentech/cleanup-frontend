import Logout from "@/common/logout"
import { UserData } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import { Title, Italic, Text } from "@tremor/react"
import { useSession } from "next-auth/react"

const Factories = () => {
    const { data } = useSession()
    const user = data?.user as UserData

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Admin dashboard for Cleanup {' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <AdminNavigation />
        </div >
    )
}

export default Factories
