import Navigation from "@/common/navigation"
import { HomeIcon, TruckIcon, CameraIcon } from "@heroicons/react/24/outline"

const OperatorNavigation = () => {
    return (
        <Navigation className="mt-6" data={[
            { icon: HomeIcon, text: 'Home', path: '/operator' },
            { icon: TruckIcon, text: 'Delivery Challans', path: '/operator/challans' },
            { icon: CameraIcon, text: 'Scanner', path: '/operator/scanner' },
        ]} />
    )
}

export default OperatorNavigation
