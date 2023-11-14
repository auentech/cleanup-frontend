import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import {
    AdminDashboardResponse,
    Order,
    OrdersResponse,
    Store,
    StoresResponse,
    UserData,
} from '@/common/types'
import {
    Title,
    Text,
    Italic,
    Grid,
    Card,
    TextInput,
    AreaChart,
    Flex,
    Icon,
    Metric,
    Table,
    Button,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    List,
    ListItem,
    Callout,
} from '@tremor/react'
import { useSession } from 'next-auth/react'
import AdminNavigation from '@/components/admin/admin-navigation'
import useAxios from '@/common/axios'
import { useEffect, useState } from 'react'
import {
    ArchiveBoxArrowDownIcon,
    CheckIcon,
    CurrencyRupeeIcon,
    ReceiptPercentIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import lodashSumBy from 'lodash/sumBy'
import lodashMap from 'lodash/map'
import lodashSortBy from 'lodash/sortBy'
import dayjs from 'dayjs'
import Link from 'next/link'
import TableSkeleton from '@/components/table-skeleton'
import { Skeleton } from '@nextui-org/react'
import FormatNumber from '@/common/number-formatter'
import StatusBadger from '@/common/status-badger'

type SalesMetricType = {
    date: string
    Cost: number
}

type OrdersMetricType = {
    date: string
    Orders: number
}

const AdminIndex = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [stores, setStores] = useState<Store[]>()
    const [cost, setCost] = useState<SalesMetricType[]>()
    const [orders, setOrders] = useState<OrdersMetricType[]>()
    const [collected, setCollected] = useState<SalesMetricType[]>()

    const [storeSearch, setStoreSearch] = useState<string>('')
    const [orderSearch, setOrderSearch] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(true)
    const [selectedStore, setSelectedStore] = useState<Store>()
    const [metrics, setMetrics] = useState<AdminDashboardResponse>()
    const [storeOrders, setStoreOrders] = useState<Order[]>()

    const calculateCost = () => {
        const orderMetrics = metrics?.metrics
        const data: SalesMetricType[] = lodashMap(
            orderMetrics,
            (theMetrics, date) => {
                return {
                    date,
                    Cost: lodashSumBy(theMetrics, 'cost'),
                }
            },
        )

        setCost(lodashSortBy(data, 'date'))
    }

    const calculateCollected = () => {
        const orderMetrics = metrics?.metrics
        const data: SalesMetricType[] = lodashMap(
            orderMetrics,
            (theMetrics, date) => {
                return {
                    date,
                    Cost: lodashSumBy(theMetrics, 'paid'),
                }
            },
        )

        setCollected(lodashSortBy(data, 'date'))
    }

    const calculateOrders = () => {
        const orderMetrics = metrics?.metrics
        const data: OrdersMetricType[] = lodashMap(
            orderMetrics,
            (theMetrics, date) => {
                return {
                    date,
                    Orders: theMetrics.length,
                }
            },
        )

        setOrders(lodashSortBy(data, 'date'))
    }

    useEffect(() => {
        const initData = async () => {
            if (selectedStore) {
                const dataResponse = await axios.get<AdminDashboardResponse>(
                    'dashboard/admin',
                    {
                        params: {
                            store: selectedStore.id,
                        },
                    },
                )

                setStoreOrders(dataResponse.data.data)
                setMetrics(dataResponse.data)
                return
            }

            const dataResponse =
                await axios.get<AdminDashboardResponse>('dashboard/admin')

            setStoreOrders(dataResponse.data.data)
            setMetrics(dataResponse.data)
            setLoading(false)
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
            const storesResponse = await axios.get<StoresResponse>(
                'search/store',
                {
                    params: { search: storeSearch },
                },
            )

            setStores(storesResponse.data.data)
        }

        searchStore()
    }, [storeSearch])

    useEffect(() => {
        const searchOrders = async () => {
            const ordersResponse = await axios.get<OrdersResponse>(
                '/search/admin/order',
                {
                    params: { search: orderSearch },
                },
            )

            setStoreOrders(ordersResponse.data.data)
        }

        searchOrders()
    }, [orderSearch])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Admin dashboard for Cleanup{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <AdminNavigation />

            <div className="mt-6">
                <Card>
                    {!selectedStore && (
                        <>
                            <TextInput
                                placeholder="Search store"
                                onInput={(e) =>
                                    setStoreSearch(e.currentTarget.value)
                                }
                            />

                            {storeSearch && stores && (
                                <div className="mt-4">
                                    <List>
                                        {stores.map((theStore) => (
                                            <ListItem key={theStore.id}>
                                                <Text>
                                                    {theStore.name} -{' '}
                                                    {theStore.code} -{' '}
                                                    {
                                                        theStore.profile
                                                            ?.district.name
                                                    }
                                                </Text>
                                                <Button
                                                    size="xs"
                                                    icon={CheckIcon}
                                                    variant="secondary"
                                                    onClick={(e) =>
                                                        setSelectedStore(
                                                            theStore,
                                                        )
                                                    }
                                                >
                                                    Select store
                                                </Button>
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            )}
                        </>
                    )}

                    {selectedStore && (
                        <Callout
                            color="green"
                            title="Reports for selected store"
                        >
                            Reports for {selectedStore.name} store with code{' '}
                            {selectedStore.code} will be displayed
                        </Callout>
                    )}
                </Card>
            </div>

            <div className="mt-4">
                <Grid numItemsLg={3} className="gap-6">
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={ReceiptPercentIcon}
                                variant="light"
                                color="blue"
                                size="xl"
                            ></Icon>
                            <div className="truncate">
                                <Title>Billing</Title>
                                <Metric>
                                    {loading ? (
                                        <Skeleton className="h-3 w-full rounded-lg" />
                                    ) : (
                                        '₹ ' +
                                        FormatNumber(lodashSumBy(cost, 'Cost'))
                                    )}
                                </Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={cost as SalesMetricType[]}
                            index="date"
                            categories={['Cost']}
                            colors={['blue']}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>

                    <Card decoration="top" decorationColor="orange">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={CurrencyRupeeIcon}
                                variant="light"
                                color="orange"
                                size="xl"
                            ></Icon>
                            <div className="truncate">
                                <Title>Collected</Title>
                                <Metric>
                                    {loading ? (
                                        <Skeleton className="h-3 w-full rounded-lg" />
                                    ) : (
                                        '₹ ' +
                                        FormatNumber(
                                            lodashSumBy(collected, 'Cost'),
                                        )
                                    )}
                                </Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={collected as SalesMetricType[]}
                            index="date"
                            categories={['Cost']}
                            colors={['orange']}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>

                    <Card decoration="top" decorationColor="fuchsia">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={ArchiveBoxArrowDownIcon}
                                variant="light"
                                color="fuchsia"
                                size="xl"
                            ></Icon>
                            <div className="truncate">
                                <Title>Orders</Title>
                                <Metric>
                                    {loading ? (
                                        <Skeleton className="h-3 w-full rounded-lg" />
                                    ) : (
                                        lodashSumBy(orders, 'Orders')
                                    )}
                                </Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={orders as OrdersMetricType[]}
                            index="date"
                            categories={['Orders']}
                            colors={['fuchsia']}
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
                    <Text>
                        Orders across stores will be displayed in realtime
                    </Text>

                    <TextInput
                        value={orderSearch}
                        icon={MagnifyingGlassIcon}
                        onInput={(e) => setOrderSearch(e.currentTarget.value)}
                        placeholder="Search orders..."
                        className="my-2"
                    />

                    <div className="mt-2">
                        {loading ? (
                            <TableSkeleton numRows={5} numCols={8} />
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Code</TableHeaderCell>
                                        <TableHeaderCell>
                                            Customer
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Order date
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Store code
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Due Date
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Status
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Amount
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Action
                                        </TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {storeOrders?.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.code}</TableCell>
                                            <TableCell>
                                                {order.customer?.name}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(order.created_at).format(
                                                    'DD, MMMM YY',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {order.store?.code}
                                            </TableCell>
                                            <TableCell>
                                                {order.due_date
                                                    ? dayjs(
                                                        order.due_date,
                                                    ).format('DD, MMMM YY')
                                                    : 'General'}
                                            </TableCell>
                                            <TableCell>
                                                {StatusBadger(order.status)}
                                            </TableCell>
                                            <TableCell>
                                                ₹ {FormatNumber(order.cost)}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={
                                                        '/admin/stores/' +
                                                        order?.store?.id +
                                                        '/orders/' +
                                                        order.code
                                                    }
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        color="gray"
                                                        icon={
                                                            ReceiptPercentIcon
                                                        }
                                                    >
                                                        Show order
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default isUser(AdminIndex, ['admin'])
