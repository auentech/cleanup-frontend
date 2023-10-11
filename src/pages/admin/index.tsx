import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { UserData } from "@/common/types"
import { BeakerIcon, BuildingStorefrontIcon, HomeIcon, NewspaperIcon, UserIcon } from "@heroicons/react/24/outline"
import { Title, Text, Italic } from "@tremor/react"
import { useSession } from "next-auth/react"
import Navigation from "@/common/navigation"

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

            <Navigation className="mt-6" data={[
                { icon: HomeIcon, text: 'Home', path: '/admin' },
                { icon: BuildingStorefrontIcon, text: 'Stores', path: '/admin/stores' },
                { icon: BeakerIcon, text: 'Factories', path: '/factories' },
                { icon: UserIcon, text: 'Workers', path: '/workers' },
                { icon: NewspaperIcon, text: 'Reports', path: '/admin/reports' },
            ]} />
        </div >
    )
}

export default isUser(AdminIndex, ['admin'])
