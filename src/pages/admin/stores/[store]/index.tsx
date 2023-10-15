import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { OrdersResponse, StatusEnum, StoreResponse } from "@/common/types"
import { ArrowLeftIcon, ArrowPathIcon, BuildingStorefrontIcon, ExclamationTriangleIcon, PencilIcon, ReceiptPercentIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline"
import { Badge, Button, Card, Flex, Grid, Icon, Tab, TabGroup, TabList, TabPanel, TabPanels, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import AdminNavigation from "@/components/admin/admin-navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import StoreKPICards from "@/components/store/store-kpi-cards"

const LazyEditStore = dynamic(() => import('@/components/admin/edit-store'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const ShowStore = () => {
    const axios = useAxios()
    const router = useRouter()

    const [theIndex, setTheIndex] = useState<number>(0)
    const [store, setStore] = useState<StoreResponse>()
    const [loading, setLoading] = useState<boolean>(true)
    const [orders, setOrders] = useState<OrdersResponse>()

    useEffect(() => {
        (async () => {
            const storeResponse = await axios.get<StoreResponse>('/stores/' + router.query.store, {
                params: {
                    include: [
                        'profile.state',
                        'profile.district',

                        'operators.user',
                        'operators.user.profile.state',
                        'operators.user.profile.district'
                    ]
                }
            })

            const ordersResponse = await axios.get<OrdersResponse>('/stores/' + router.query.store + '/orders', {
                params: {
                    include: ['customer']
                },
            })

            setStore(storeResponse.data)
            setOrders(ordersResponse.data)

            setLoading(false)
        })()
    }, [])

    const statusBadger = (status: StatusEnum) => {
        switch (status) {
            case 'received':
                return <Badge color="red" size="sm" icon={ExclamationTriangleIcon}>Unprocessed</Badge>
            case 'in_process':
                return <Badge color="blue" size="sm" icon={ArrowPathIcon}>In Factory</Badge>
            case 'in_store':
            case 'processed':
                return <Badge color="yellow" size="sm" icon={BuildingStorefrontIcon}>In store</Badge>
            case 'delivered':
                return <Badge color="green" size="sm" icon={UserIcon}>Delivered</Badge>
        }
    }

    const StoreBody = () => (
        <div>
            <Flex justifyContent="between" className="space-x-6">
                <div>
                    <Flex>
                        <Icon icon={ArrowLeftIcon} onClick={() => router.back()} style={{ cursor: 'pointer' }}></Icon>
                        <Title>{store?.data.name} store</Title>
                        <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">{store?.data.code}</Badge>
                    </Flex>
                </div>
                <div className="space-x-4">
                    <Button color="red" variant="secondary" icon={TrashIcon}>Delete</Button>
                    <Button variant="secondary" icon={PencilIcon}>Edit</Button>
                </div>
            </Flex>
            <Text>Store located at: {store?.data?.profile?.address}</Text>

            <AdminNavigation />

            <div className="mt-6">
                <Grid numItemsLg={3} className="gap-6">
                    <StoreKPICards store={store} />
                </Grid>
            </div>

            <div className="mt-6">
                <Card>
                    <TabGroup index={theIndex} onIndexChange={setTheIndex}>
                        <TabList variant="solid">
                            <Tab icon={ReceiptPercentIcon}>Orders</Tab>
                            <Tab icon={PencilIcon}>Settings</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel className="mt-6">
                                <Title>Orders</Title>
                                <Text>All the orders in your store</Text>

                                <Table className="mt-4">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Code</TableHeaderCell>
                                            <TableHeaderCell>Customer</TableHeaderCell>
                                            <TableHeaderCell>Order date</TableHeaderCell>
                                            <TableHeaderCell>Garments</TableHeaderCell>
                                            <TableHeaderCell>Status</TableHeaderCell>
                                            <TableHeaderCell>Amount</TableHeaderCell>
                                            <TableHeaderCell>Action</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orders?.data.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.code}</TableCell>
                                                <TableCell>{order.customer?.name}</TableCell>
                                                <TableCell>{dayjs(order.created_at).format('DD, MMMM YY')}</TableCell>
                                                <TableCell>{order.count}</TableCell>
                                                <TableCell>{statusBadger(order.status)}</TableCell>
                                                <TableCell>₹ {order.cost}</TableCell>
                                                <TableCell>
                                                    <Link href={'/admin/stores/' + store?.data.id + '/orders/' + order.code}>
                                                        <Button variant="secondary" color="gray" icon={ReceiptPercentIcon}>Show order</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabPanel>

                            <TabPanel className="mt-6">
                                <Title>Edit store</Title>
                                <Text>Did not like something? Time to change that</Text>

                                {theIndex == 1 && <LazyEditStore />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
    )

    return (
        <div className="p-12">
            {loading ? (
                <Card>
                    <Flex alignItems="center" justifyContent="center">
                        <Waveform
                            size={20}
                            color="#3b82f6"
                        />
                        <div className="h-80" />
                    </Flex>
                </Card>
            ) : <StoreBody />}
        </div>
    )
}

export default isUser(ShowStore, ['admin'])
