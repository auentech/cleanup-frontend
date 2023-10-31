import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { AdminDashboardResponse, StatusEnum, Store, StoresResponse, UserData } from "@/common/types"
import { Title, Text, Italic, Grid, Card, TextInput, AreaChart, Flex, Icon, Metric, Table, Button, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Badge, List, ListItem, Callout } from "@tremor/react"
import { useSession } from "next-auth/react"
import useAxios from "@/common/axios"
import { useEffect, useState } from "react"
import { ArchiveBoxArrowDownIcon, ArrowPathIcon, BuildingStorefrontIcon, CheckIcon, CurrencyRupeeIcon, ExclamationTriangleIcon, ReceiptPercentIcon, UserIcon } from "@heroicons/react/24/outline"
import lodashSumBy from 'lodash/sumBy'
import lodashMap from 'lodash/map'
import lodashSortBy from 'lodash/sortBy'
import dayjs from "dayjs"
import Link from "next/link"
import ManagerNavigation from "@/components/manager/manager-navigation"

type SalesMetricType = {
    date: string,
    Cost: number
}

type OrdersMetricType = {
    date: string,
    Orders: number
}

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

const AdminIndex = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [stores, setStores] = useState<Store[]>()
    const [cost, setCost] = useState<SalesMetricType[]>()
    const [orders, setOrders] = useState<OrdersMetricType[]>()
    const [collected, setCollected] = useState<SalesMetricType[]>()

    const [search, setSearch] = useState<string>('')
    const [selectedStore, setSelectedStore] = useState<Store>()
    const [metrics, setMetrics] = useState<AdminDashboardResponse>()

    const calculateCost = () => {
        const orderMetrics = metrics?.metrics
        const data: SalesMetricType[] = lodashMap(orderMetrics, (theMetrics, date) => {
            return {
                date,
                Cost: lodashSumBy(theMetrics, 'cost')
            }
        })

        setCost(lodashSortBy(data, 'date'))
    }

    const calculateCollected = () => {
        const orderMetrics = metrics?.metrics
        const data: SalesMetricType[] = lodashMap(orderMetrics, (theMetrics, date) => {
            return {
                date,
                Cost: lodashSumBy(theMetrics, 'paid')
            }
        })

        setCollected(lodashSortBy(data, 'date'))
    }

    const calculateOrders = () => {
        const orderMetrics = metrics?.metrics
        const data: OrdersMetricType[] = lodashMap(orderMetrics, (theMetrics, date) => {
            return {
                date,
                Orders: theMetrics.length
            }
        })

        setOrders(lodashSortBy(data, 'date'))
    }

    useEffect(() => {
        const initData = async () => {
            if (selectedStore) {
                const dataResponse = await axios.get<AdminDashboardResponse>('dashboard/admin', {
                    params: {
                        store: selectedStore.id
                    }
                })

                setMetrics(dataResponse.data)
                return
            }

            const dataResponse = await axios.get<AdminDashboardResponse>('dashboard/admin')
            setMetrics(dataResponse.data)
        }

        initData()
    }, [selectedStore])

    useEffect(() => {
        calculateCost()
        calculateCollected()
        calculateOrders()
    }, [metrics])

    useEffect(() => {
        const searchStore = async () => {
            const storesResponse = await axios.get<StoresResponse>('search/store', {
                params: { search }
            })

            setStores(storesResponse.data.data)
        }

        searchStore()
    }, [search])

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
                <Card>
                    {!selectedStore && (
                        <>
                            <TextInput placeholder="Search store" onInput={e => setSearch(e.currentTarget.value)} />

                            {(search && stores) && (
                                <div className="mt-4">
                                    <List>
                                        {stores.map(theStore => (
                                            <ListItem key={theStore.id}>
                                                <Text>
                                                    {theStore.name} - {theStore.code} - {theStore.profile?.district.name}
                                                </Text>
                                                <Button
                                                    size="xs"
                                                    icon={CheckIcon}
                                                    variant="secondary"
                                                    onClick={e => setSelectedStore(theStore)}
                                                >Select store
                                                </Button>
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            )}
                        </>
                    )}

                    {selectedStore && (
                        <Callout color="green" title="Reports for selected store">
                            Reports for {selectedStore.name} store with code {selectedStore.code} will be displayed
                        </Callout>
                    )}
                </Card>
            </div>

            <div className="mt-4">
                <Grid numItemsLg={3} className="gap-6">
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ReceiptPercentIcon} variant="light" color="blue" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Billing</Title>
                                <Metric>₹ {lodashSumBy(cost, 'Cost')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={cost as SalesMetricType[]}
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

                    <Card decoration="top" decorationColor="orange">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={CurrencyRupeeIcon} variant="light" color="orange" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Collected</Title>
                                <Metric>₹ {lodashSumBy(collected, 'Cost')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={collected as SalesMetricType[]}
                            index="date"
                            categories={['Cost']}
                            colors={["orange"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>

                    <Card decoration="top" decorationColor="fuchsia">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ArchiveBoxArrowDownIcon} variant="light" color="fuchsia" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Orders</Title>
                                <Metric>{lodashSumBy(orders, 'Orders')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={orders as OrdersMetricType[]}
                            index="date"
                            categories={['Orders']}
                            colors={["fuchsia"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                </Grid>
            </div>

            <div className="mt-4">
                <Card>
                    <Title>Live orders</Title>
                    <Text>Orders across stores will be displayed in realtime</Text>

                    <Table className="mt-2">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Code</TableHeaderCell>
                                <TableHeaderCell>Customer</TableHeaderCell>
                                <TableHeaderCell>Order date</TableHeaderCell>
                                <TableHeaderCell>Store code</TableHeaderCell>
                                <TableHeaderCell>Garments</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Amount</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {metrics?.data.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.code}</TableCell>
                                    <TableCell>{order.customer?.name}</TableCell>
                                    <TableCell>{dayjs(order.created_at).format('DD, MMMM YY')}</TableCell>
                                    <TableCell>{order.store?.code}</TableCell>
                                    <TableCell>{order.count}</TableCell>
                                    <TableCell>{statusBadger(order.status)}</TableCell>
                                    <TableCell>₹ {order.cost}</TableCell>
                                    <TableCell>
                                        <Link href={'/manager/stores/' + order?.store?.id + '/orders/' + order.code}>
                                            <Button variant="secondary" color="gray" icon={ReceiptPercentIcon}>Show order</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}

export default isUser(AdminIndex, ['manager'])