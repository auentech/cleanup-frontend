import Navigation from "@/common/navigation"
import { HomeIcon, TruckIcon, CameraIcon, ReceiptRefundIcon, UsersIcon } from "@heroicons/react/24/outline"

const OperatorNavigation = () => {
    return (
        <Navigation className="mt-6" data={[
            { icon: HomeIcon, text: 'Home', path: '/operator' },
            { icon: ReceiptRefundIcon, text: 'Rewash', path: '/operator/rewash' },
            {
                icon: TruckIcon,
                text: 'Delivery Challans',
                path: '/operator/challans',
                subPath: [
                    '/operator/challans/[challan]'
                ]
            },
            { icon: CameraIcon, text: 'Scanner', path: '/operator/scanner' },
            {
                icon: UsersIcon,
                text: 'Customers',
                path: '/operator/customers',
                subPath: [
                    '/operator/customers/[customer]/orders'
                ]
            },
        ]} />
    )
}

export default OperatorNavigation
