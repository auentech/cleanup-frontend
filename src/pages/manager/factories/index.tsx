import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { FactoriesResponse, UserData } from "@/common/types"
import ManagerNavigation from "@/components/manager/manager-navigation"
import TableSkeleton from "@/components/table-skeleton"
import { BeakerIcon } from "@heroicons/react/24/outline"
import { Title, Italic, Text, Card, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Button, TabGroup, TabList, Tab, TabPanels, TabPanel, Flex } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useState } from "react"

const LazyCreateFactory = dynamic(() => import('@/components/admin/create-factory'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const Factories = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [theIndex, setTheIndex] = useState<number>(0)
    const [factories, setFactories] = useState<FactoriesResponse>()

    useEffect(() => {
        (async () => {
            const response = await axios.get<FactoriesResponse>('/factories', {
                params: {
                    include: ['profile.state', 'profile.district']
                }
            })

            setFactories(response.data)
        })()
    }, [])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Manager dashboard for Cleanup {' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <ManagerNavigation />

            <div className="mt-6">
                <Card decoration="top" decorationColor="blue">
                    <Title>Factories</Title>
                    <Text>All factories in your company</Text>

                    <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                        <TabList>
                            <Tab>List factories</Tab>
                            <Tab>Create factory</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <div className="mt-4">
                                    {factories == undefined ? (
                                        <TableSkeleton numCols={7} numRows={5} />
                                    ) : (
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableHeaderCell>Code</TableHeaderCell>
                                                    <TableHeaderCell>Name</TableHeaderCell>
                                                    <TableHeaderCell>Address</TableHeaderCell>
                                                    <TableHeaderCell>Pincode</TableHeaderCell>
                                                    <TableHeaderCell>State</TableHeaderCell>
                                                    <TableHeaderCell>District</TableHeaderCell>
                                                    <TableHeaderCell>Action</TableHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {factories.data.map(factory => (
                                                    <TableRow key={factory.id}>
                                                        <TableCell>{factory.code}</TableCell>
                                                        <TableCell>{factory.name}</TableCell>
                                                        <TableCell>{factory.profile?.address}</TableCell>
                                                        <TableCell>{factory.profile?.pincode}</TableCell>
                                                        <TableCell>{factory.profile?.state.name}</TableCell>
                                                        <TableCell>{factory.profile?.district.name}</TableCell>
                                                        <TableCell>
                                                            <Link href={'/manager/factories/' + factory.id}>
                                                                <Button icon={BeakerIcon} size="xs" variant="secondary" color="gray">
                                                                    Show factory
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel>
                                {theIndex == 1 && <LazyCreateFactory />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div >
    )
}

export default isUser(Factories, ['manager'])
