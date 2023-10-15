import { ReactNode } from "react"

type TimelineProps = {
    children: ReactNode
}

const Timeline = ({ children }: TimelineProps) => {
    return (
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
            {children}
        </ol>
    )
}

export default Timeline
