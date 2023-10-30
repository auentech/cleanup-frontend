import Navigation from "@/common/navigation"
import { BeakerIcon, BuildingStorefrontIcon, HomeIcon, UserIcon } from "@heroicons/react/24/outline"

const ManagerNavigation = () => {
    return (
        <Navigation className="mt-6" data={[
            { icon: HomeIcon, text: 'Home', path: '/manager' },
            {
                icon: BuildingStorefrontIcon,
                text: 'Stores',
                path: '/manager/stores',
                subPath: [
                    '/manager/stores/[store]',
                    '/manager/stores/[store]/orders/[order]',
                ]
            },
            {
                icon: BeakerIcon,
                text: 'Factories',
                path: '/manager/factories',
                subPath: [
                    '/manager/factories/[factory]',
                    '/manager/stores/[store]/challans/[challan]'
                ]
            },
            { icon: UserIcon, text: 'Workers', path: '/manager/workers' },
        ]} />
    )
}

export default ManagerNavigation
