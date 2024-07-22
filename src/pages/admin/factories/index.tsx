import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { FactoriesResponse, UserData } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import TableSkeleton from "@/components/table-skeleton"
import { BeakerIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@tanstack/react-query"
import { Title, Italic, Text, Card, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Button, TabGroup, TabList, Tab, TabPanels, TabPanel, Flex } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useState } from "react"

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

    const { data: factories, isLoading: factoriesLoading } = useQuery({
        queryKey: ['factories'],
        queryFn: ({ signal }) => axios.get<FactoriesResponse>('/factories', {
            signal,
            params: {
                include: ['profile.state', 'profile.district']
            },
        }),
        select: data => data.data,
    })

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
                                    {factoriesLoading ? (
                                        <TableSkeleton numCols={7} numRows={15} />
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
                                                {factories?.data.map(factory => (
                                                    <TableRow key={factory.id}>
                                                        <TableCell>{factory.code}</TableCell>
                                                        <TableCell>{factory.name}</TableCell>
                                                        <TableCell>{factory.profile?.address}</TableCell>
                                                        <TableCell>{factory.profile?.pincode}</TableCell>
                                                        <TableCell>{factory.profile?.state.name}</TableCell>
                                                        <TableCell>{factory.profile?.district.name}</TableCell>
                                                        <TableCell>
                                                            <Link href={'/admin/factories/' + factory.id}>
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

export default isUser(Factories, ['admin'])
