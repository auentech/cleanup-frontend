import { ReactNode } from "react"

type TimelineProps = {
    children: ReactNode
    className?: string
}

const Timeline = ({ children, className }: TimelineProps) => {
    return (
        <ol className={"relative border-l border-gray-200 dark:border-gray-700 " + className}>
            {children}
        </ol>
    )
}

export default Timeline
