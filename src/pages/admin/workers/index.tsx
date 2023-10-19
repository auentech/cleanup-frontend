import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { UserData, UsersResponse } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import { Title, Italic, Text, Card, TabGroup, TabList, Tab, TabPanels, TabPanel, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Button, Flex } from "@tremor/react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { UserIcon } from "@heroicons/react/24/outline"
import { Waveform } from "@uiball/loaders"
import dynamic from "next/dynamic"

const LazyCreateWorker = dynamic(() => import('@/components/admin/create-worker'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const Workers = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [theIndex, setTheIndex] = useState<number>(0)
    const [workers, setWorkers] = useState<UsersResponse>()

    useEffect(() => {
        (async () => {
            const response = await axios.get<UsersResponse>('/workers', {
                params: {
                    include: ['profile.state', 'profile.district']
                }
            })

            setWorkers(response.data)
        })()
    }, [])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Admin dashboard for Cleanup {' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <AdminNavigation />

            <Card decoration="top" className="mt-6">
                <Title>Workers</Title>
                <Text>All workers in your company</Text>

                <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                    <TabList>
                        <Tab>List workers</Tab>
                        <Tab>Create workers</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Table className="mt-4">
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>Role</TableHeaderCell>
                                        <TableHeaderCell>Email</TableHeaderCell>
                                        <TableHeaderCell>Phone</TableHeaderCell>
                                        <TableHeaderCell>State</TableHeaderCell>
                                        {/* <TableHeaderCell>Action</TableHeaderCell> */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {workers?.data.map(worker => (
                                        <TableRow key={worker.id}>
                                            <TableCell>{worker.name}</TableCell>
                                            <TableCell>
                                                <Badge style={{ textTransform: 'capitalize' }}>
                                                    {worker.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{worker.email}</TableCell>
                                            <TableCell>{worker.phone}</TableCell>
                                            <TableCell>{worker?.profile?.state.name}</TableCell>
                                            {/* <TableCell>
                                                <Button icon={UserIcon} variant="secondary" color="gray">Show worker</Button>
                                            </TableCell> */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabPanel>
                        <TabPanel>
                            {theIndex == 1 && <LazyCreateWorker />}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
        </div>
    )
}

export default isUser(Workers, ['admin'])
