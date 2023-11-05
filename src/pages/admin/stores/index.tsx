import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { StoresResponse, UserData } from "@/common/types"
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline"
import { Button, Card, Flex, Italic, Tab, TabGroup, TabList, TabPanel, TabPanels, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import AdminNavigation from "@/components/admin/admin-navigation"
import TableSkeleton from "@/components/table-skeleton"

const LazyCreateStore = dynamic(() => import('@/components/admin/create-store'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const StoreIndex = () => {
    const { data } = useSession()
    const axios = useAxios()

    const user = data?.user as UserData
    const [theIndex, setTheIndex] = useState<number>(0)
    const [stores, setStores] = useState<StoresResponse | undefined>(undefined)

    useEffect(() => {
        const getStores = async () => {
            const response = await axios.get<StoresResponse>('/stores?include=profile,profile.state,profile.district')
            setStores(response.data)
        }

        getStores()
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

            <Card className="mt-6" decoration="top">
                <Title>Stores</Title>
                <Text>Time to do some magic with these stores</Text>
                <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                    <TabList>
                        <Tab>List Stores</Tab>
                        <Tab>Create Store</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="mt-4">
                                {stores === undefined ? (
                                    <TableSkeleton numCols={7} numRows={5} />
                                ) : (
                                    <Table className="mt-4">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeaderCell>Store Code</TableHeaderCell>
                                                <TableHeaderCell>Name</TableHeaderCell>
                                                <TableHeaderCell>Address</TableHeaderCell>
                                                <TableHeaderCell>Pincode</TableHeaderCell>
                                                <TableHeaderCell>State</TableHeaderCell>
                                                <TableHeaderCell>District</TableHeaderCell>
                                                <TableHeaderCell>Action</TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stores.data.map(store => (
                                                <TableRow key={store.id}>
                                                    <TableCell>{store.code}</TableCell>
                                                    <TableCell>{store.name}</TableCell>
                                                    <TableCell>{store?.profile?.address}</TableCell>
                                                    <TableCell>{store?.profile?.pincode}</TableCell>
                                                    <TableCell>{store?.profile?.state.name}</TableCell>
                                                    <TableCell>{store?.profile?.district.name}</TableCell>
                                                    <TableCell>
                                                        <Link href={'/admin/stores/' + store.id}>
                                                            <Button icon={BuildingStorefrontIcon} size="xs" variant="secondary" color="gray">
                                                                Show store
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
                            {theIndex == 1 && <LazyCreateStore />}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
        </div>
    )
}

export default isUser(StoreIndex, ['admin'])
