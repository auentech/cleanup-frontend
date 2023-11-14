import { ArrowPathIcon, BuildingStorefrontIcon, ExclamationTriangleIcon, UserIcon } from "@heroicons/react/24/outline"
import { Badge } from "@tremor/react"
import { StatusEnum } from "./types"

const StatusBadger = (status: StatusEnum) => {
    switch (status) {
        case 'received':
            return <Badge color="red" size="sm" icon={ExclamationTriangleIcon}>Unprocessed</Badge>
        case 'in_process':
            return <Badge color="blue" size="sm" icon={ArrowPathIcon}>In Factory</Badge>
        case 'in_store':
        case 'processed':
            return <Badge color="yellow" size="sm" icon={BuildingStorefrontIcon}>In store</Badge>
        case 'delivered':
            return <Badge color="green" size="sm" icon={UserIcon}>Delivered</Badge>
    }
}

export default StatusBadger
