import Navigation from "@/common/navigation"
import { BeakerIcon, BuildingStorefrontIcon, HomeIcon, NewspaperIcon, UserIcon } from "@heroicons/react/24/outline"

const AdminNavigation = () => {
    return (
        <Navigation className="mt-6" data={[
            { icon: HomeIcon, text: 'Home', path: '/admin' },
            {
                icon: BuildingStorefrontIcon,
                text: 'Stores',
                path: '/admin/stores',
                subPath: ['/admin/stores/[store]']
            },
            { icon: BeakerIcon, text: 'Factories', path: '/admin/factories' },
            { icon: UserIcon, text: 'Workers', path: '/admin/workers' },
            { icon: NewspaperIcon, text: 'Reports', path: '/admin/reports' },
        ]} />
    )
}

export default AdminNavigation
