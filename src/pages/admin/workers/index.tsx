import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { UserData, UsersResponse } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import { Title, Italic, Text, Card, TabGroup, TabList, Tab, TabPanels, TabPanel, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Button } from "@tremor/react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { md5 } from 'js-md5'
import { UserIcon } from "@heroicons/react/24/outline"

const Workers = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

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

                <TabGroup className="mt-4">
                    <TabList>
                        <Tab>List workers</Tab>
                        <Tab>Create workers</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Table className="mt-4">
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Profile</TableHeaderCell>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>Role</TableHeaderCell>
                                        <TableHeaderCell>Email</TableHeaderCell>
                                        <TableHeaderCell>Phone</TableHeaderCell>
                                        <TableHeaderCell>State</TableHeaderCell>
                                        <TableHeaderCell>Action</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {workers?.data.map(worker => (
                                        <TableRow key={worker.id}>
                                            <TableCell>
                                                <img className="rounded-full w-10 h-10" src={process.env.NEXT_PUBLIC_BACKEND_URL + 'storage/avatars/' + md5(worker.email) + '.jpg'} alt="" />
                                            </TableCell>
                                            <TableCell>{worker.name}</TableCell>
                                            <TableCell>
                                                <Badge style={{ textTransform: 'capitalize' }}>
                                                    {worker.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{worker.email}</TableCell>
                                            <TableCell>{worker.phone}</TableCell>
                                            <TableCell>{worker?.profile?.state.name}</TableCell>
                                            <TableCell>
                                                <Button icon={UserIcon} variant="secondary" color="gray">Show worker</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
        </div>
    )
}

export default isUser(Workers, ['admin'])
