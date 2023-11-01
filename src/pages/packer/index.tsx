import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { Subtitle, Title, Italic, Card, TabList, TabGroup, Tab, TabPanels, TabPanel, Flex } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { useState } from "react"

const LazyCreateReturn = dynamic(() => import('@/components/create-return'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const PackerHome = () => {
    const { data } = useSession()
    const user = data?.user

    const [index, setIndex] = useState<number>(0)

    return (
        <div className="p-12">
            <Title>Operator dashboard</Title>
            <Subtitle>
                Operator dashboard for {user?.name}{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Subtitle>

            <div className="mt-4">
                <Card>
                    <Title>Return challans</Title>
                    <Subtitle>Send orders back to the store</Subtitle>

                    <TabGroup className="mt-2" onIndexChange={setIndex}>
                        <TabList>
                            <Tab>List challans</Tab>
                            <Tab>Create challan</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>

                            </TabPanel>

                            <TabPanel>
                                {index == 1 && <LazyCreateReturn />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
    )
}

export default isUser(PackerHome, ['packer'])
