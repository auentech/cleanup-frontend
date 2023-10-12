import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { UserData } from "@/common/types"
import { Title, Text, Italic } from "@tremor/react"
import { useSession } from "next-auth/react"
import AdminNavigation from "@/components/admin/admin-navigation"

const AdminIndex = () => {
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

export default isUser(AdminIndex, ['admin'])
