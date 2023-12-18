import Navigation from '@/common/navigation'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import {
    BeakerIcon,
    BuildingStorefrontIcon,
    HomeIcon,
    NewspaperIcon,
    UserIcon,
} from '@heroicons/react/24/outline'

const AdminNavigation = () => {
    return (
        <Navigation
            className="mt-6"
            data={[
                { icon: HomeIcon, text: 'Home', path: '/admin' },
                {
                    icon: BuildingStorefrontIcon,
                    text: 'Stores',
                    path: '/admin/stores',
                    subPath: [
                        '/admin/stores/[store]',
                        '/admin/stores/[store]/orders/[order]',
                    ],
                },
                {
                    icon: BeakerIcon,
                    text: 'Factories',
                    path: '/admin/factories',
                    subPath: [
                        '/admin/factories/[factory]',
                        '/admin/stores/[store]/challans/[challan]',
                    ],
                },
                {
                    icon: UserIcon,
                    text: 'Users',
                    path: '/admin/users',
                    subPath: ['/admin/users/[user]/orders'],
                },
                {
                    icon: NewspaperIcon,
                    text: 'Reports',
                    path: '/admin/reports',
                },
                {
                    icon: PencilSquareIcon,
                    text: 'Services',
                    path: '/admin/services',
                    subPath: ['/admin/services/[service]/garments'],
                },
            ]}
        />
    )
}

export default AdminNavigation
