import { Tab, TabGroup, TabList } from "@tremor/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import _ from 'lodash'

type NavigationItem = {
    icon?: any
    text: string
    path: string
}

type NavigationProps = {
    data: NavigationItem[]
    className?: string
}

const Navigation = ({ data, className }: NavigationProps) => {
    const router = useRouter()
    const [theIndex, setTheIndex] = useState<number>(0)

    const handleIndexChange = (index: number) => {
        router.push(data[index].path)
    }

    useEffect(() => {
        const index = _.findIndex(data, (item) => item.path == router.pathname)
        setTheIndex(index)
    }, [router.pathname])

    return (
        <TabGroup className={className} index={theIndex} onIndexChange={handleIndexChange}>
            <TabList>
                {data.map((item, index) => (
                    <Tab key={index} icon={item.icon}>{item.text}</Tab>
                ))}
            </TabList>
        </TabGroup>
    )
}

export default Navigation
