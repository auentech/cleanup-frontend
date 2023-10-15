import { Icon } from "@tremor/react"
import Link from "next/link"
import { ElementType } from "react"

type TimelineButtonProps = {
    text: string
    link: string
    icon: ElementType
}

const TimelineButton = ({ text, link, icon }: TimelineButtonProps) => {
    return (
        <Link href={link} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-200 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
            {text}
            <Icon className="w-3 h-3 ml-2 mr-2" icon={icon} />
        </Link>
    )
}

export default TimelineButton
