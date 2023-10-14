import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { OrdersResponse, StatusEnum, StoreResponse } from "@/common/types"
import { ArchiveBoxIcon, ArrowLeftIcon, ArrowPathIcon, BuildingStorefrontIcon, ExclamationTriangleIcon, PencilIcon, ReceiptPercentIcon, ShoppingCartIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline"
import { AreaChart, Badge, Button, Card, Flex, Grid, Icon, Metric, Tab, TabGroup, TabList, TabPanel, TabPanels, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import lodashMap from 'lodash/map'
import lodashSumBy from 'lodash/sumBy'
import lodashSortBy from 'lodash/sortBy'
import dayjs from "dayjs"
import AdminNavigation from "@/components/admin/admin-navigation"
import dynamic from "next/dynamic"

type SalesMetricType = {
    date: string,
    Cost: number
}

type OrdersMetricType = {
    date: string,
    Orders: number
}

type ClothsMetricType = {
    date: string
    Count: number
}

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

    const [salesMetrics, setSalesMetrics] = useState<SalesMetricType[]>()
    const [ordersMetrics, setOrdersMetrics] = useState<OrdersMetricType[]>()
    const [clothesMetrics, setClothesMetrics] = useState<ClothsMetricType[]>()

    useEffect(() => {
        (async () => {
            const response = await axios.get<StoreResponse>('/stores/' + router.query.store, {
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

            setLoading(false)
            setStore(response.data)
        })()
    }, [])

    useEffect(() => {
        const calculateSalesMetrics = () => {
            const theMetricOrders = store?.metrics?.ordersSevenDays
            const data = lodashMap(theMetricOrders, (theOrders, date) => {
                return {
                    date,
                    Cost: lodashSumBy(theOrders, 'cost')
                }
            })

            setSalesMetrics(lodashSortBy(data, 'date'))
        }

        const calculateOrdersMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data = lodashMap(theOrdersMetrics, (theOrders, date) => {
                return {
                    date,
                    Orders: theOrders.length
                }
            })

            setOrdersMetrics(lodashSortBy(data, 'date'))
        }

        const calculateClothesMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data = lodashMap(theOrdersMetrics, (theOrders, date) => {
                return {
                    date,
                    Count: lodashSumBy(theOrders, 'count')
                }
            })

            setClothesMetrics(lodashSortBy(data, 'date'))
        }

        calculateSalesMetrics()
        calculateOrdersMetrics()
        calculateClothesMetrics()
    }, [store])

    useEffect(() => {
        (async () => {
            const response = await axios.get<OrdersResponse>('/stores/' + router.query.store + '/orders', {
                params: {
                    include: ['customer']
                },
            })

            setOrders(response.data)
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
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ReceiptPercentIcon} variant="light" color="blue" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Sales</Title>
                                <Metric>₹ {lodashSumBy(salesMetrics, 'Cost')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6 h-28"
                            data={salesMetrics as SalesMetricType[]}
                            index="date"
                            categories={['Cost']}
                            colors={["blue"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                    <Card decoration="top" decorationColor="cyan">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ShoppingCartIcon} variant="light" color="cyan" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Orders</Title>
                                <Metric>{lodashSumBy(ordersMetrics, 'Orders')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6 h-28"
                            data={ordersMetrics as OrdersMetricType[]}
                            index="date"
                            categories={['Orders']}
                            colors={["cyan"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                    <Card decoration="top" decorationColor="pink">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ArchiveBoxIcon} variant="light" color="pink" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Clothes</Title>
                                <Metric>{lodashSumBy(clothesMetrics, 'Count')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6 h-28"
                            data={clothesMetrics as ClothsMetricType[]}
                            index="date"
                            categories={['Count']}
                            colors={["pink"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
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
                                                    <Button variant="secondary" color="gray" icon={ReceiptPercentIcon}>Show order</Button>
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
