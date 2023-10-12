import { Tab, TabGroup, TabList } from "@tremor/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import _ from 'lodash'
import Link from "next/link"

type NavigationItem = {
    icon?: any
    text: string
    path: string
    subPath?: string[]
}

type NavigationProps = {
    data: NavigationItem[]
    className?: string
}

const Navigation = ({ data, className }: NavigationProps) => {
    const router = useRouter()
    const [theIndex, setTheIndex] = useState<number>(0)

    useEffect(() => {
        const index = _.findIndex(data, (item) => {
            const isSubPath = !!item.subPath?.includes(router.pathname)
            return (item.path == router.pathname) || isSubPath
        })

        if (index >= 0) {
            setTheIndex(index)
            return
        }

        setTheIndex(0)
    }, [router.pathname])

    return (
        <TabGroup className={className} index={theIndex}>
            <TabList>
                {data.map((item, index) => (
                    <Link href={data[index].path} key={index}>
                        <Tab icon={item.icon}>{item.text}</Tab>
                    </Link>
                ))}
            </TabList>
        </TabGroup>
    )
}

export default Navigation
