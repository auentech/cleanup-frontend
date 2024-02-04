import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import { GodMetricsResponse, OrdersResponse, Store, StoresResponse, UserData } from '@/common/types'
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
    SearchSelect,
    SearchSelectItem,
} from '@tremor/react'
import { useSession } from 'next-auth/react'
import AdminNavigation from '@/components/admin/admin-navigation'
import useAxios from '@/common/axios'
import { useEffect, useState } from 'react'
import {
    ArchiveBoxArrowDownIcon,
    CurrencyRupeeIcon,
    ReceiptPercentIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import lodashSumBy from 'lodash/sumBy'
import lodashMap from 'lodash/map'
import lodashSortBy from 'lodash/sortBy'
import lodashReverse from 'lodash/reverse'
import lodashFind from 'lodash/find'
import dayjs from 'dayjs'
import Link from 'next/link'
import TableSkeleton from '@/components/table-skeleton'
import { Pagination, Skeleton } from '@nextui-org/react'
import FormatNumber from '@/common/number-formatter'
import StatusBadger from '@/common/status-badger'
import { useDebounce } from 'use-debounce'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

type SalesMetricType = {
    date: string
    Cost: number
}

type OrdersMetricType = {
    date: string
    Orders: number
}

const ManagerIndex = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [cost, setCost] = useState<SalesMetricType[]>()
    const [orders, setOrders] = useState<OrdersMetricType[]>()
    const [collected, setCollected] = useState<SalesMetricType[]>()

    const [storeSearch, setStoreSearch] = useState<string>('')
    const [storeSearchBounced] = useDebounce<string>(storeSearch, 500)

    const [orderSearch, setOrderSearch] = useState<string>('')
    const [orderSearchBounced] = useDebounce<string>(orderSearch, 500)

    const [page, setPage] = useState<number>(1)
    const [selectedStore, setSelectedStore] = useState<Store>()

    const getOrders = async (): Promise<OrdersResponse> => {
        const params = {
            page,
            search: orderSearchBounced,
            filter: {
                store_id: selectedStore?.id,
            },
            include: ['customer', 'store'],
        }

        const endpoint = orderSearchBounced == '' ? 'orders/god-view' : 'search/admin/order'
        const data = await axios.get<OrdersResponse>(endpoint, { params })

        return data.data
    }

    const {
        isLoading: ordersLoading,
        isError: ordersError,
        data: ordersResponse,
    } = useQuery({
        initialData: keepPreviousData,
        queryKey: ['admin dashboard', selectedStore?.id, orderSearchBounced, page],
        queryFn: () => getOrders(),
        select: (data) => data as OrdersResponse,
    })

    const {
        data: metricsResponse,
        isLoading: metricsLoading,
        isError: metricsError,
    } = useQuery({
        initialData: keepPreviousData,
        queryKey: ['admin metrics', selectedStore?.id],
        queryFn: ({ signal }) =>
            axios.get<GodMetricsResponse>('dashboard/god-metrics', {
                params: {
                    store_id: selectedStore?.id,
                },
                signal,
            }),
        select: (data) => {
            const typedData = data as AxiosResponse<GodMetricsResponse, any>
            return typedData.data
        },
    })

    const {
        data: stores,
        isLoading: storesLoading,
        isError: storesError,
    } = useQuery({
        initialData: keepPreviousData,
        queryKey: ['admin store', storeSearchBounced],
        queryFn: ({ signal }) =>
            axios.get<StoresResponse>('search/store', {
                params: { search: storeSearchBounced },
                signal,
            }),
        select: (data) => {
            const typed = data as AxiosResponse<StoresResponse, any>
            return typed.data
        },
    })

    const calculateCost = () => {
        const data: SalesMetricType[] = lodashMap(metricsResponse.metrics, (theMetrics, date) => {
            return {
                date,
                Cost: lodashSumBy(theMetrics, 'cost'),
            }
        })

        setCost(lodashReverse(lodashSortBy(data, 'date')))
    }

    const calculateCollected = () => {
        const data: SalesMetricType[] = lodashMap(metricsResponse.metrics, (theMetrics, date) => {
            return {
                date,
                Cost: lodashSumBy(theMetrics, 'paid'),
            }
        })

        setCollected(lodashReverse(lodashSortBy(data, 'date')))
    }

    const calculateOrders = () => {
        const data: OrdersMetricType[] = lodashMap(metricsResponse.metrics, (theMetrics, date) => {
            return {
                date,
                Orders: theMetrics.length,
            }
        })

        setOrders(lodashReverse(lodashSortBy(data, 'date')))
    }

    useEffect(() => {
        if (!metricsLoading) {
            calculateCost()
            calculateCollected()
            calculateOrders()
        }
    }, [metricsResponse])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Manager dashboard for Cleanup{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <AdminNavigation />

            <SearchSelect
                className="mt-6"
                placeholder="Search store"
                icon={MagnifyingGlassIcon}
                value={`${selectedStore?.id}`}
                onValueChange={(v) =>
                    setSelectedStore(lodashFind(stores.data, (store) => store.id == Number(v)))
                }
                onInput={(e) =>
                    setStoreSearch(
                        // @ts-ignore
                        e.currentTarget.childNodes[0].childNodes[1].value,
                    )
                }
            >
                {storesLoading ? (
                    <SearchSelectItem value="">Loading...</SearchSelectItem>
                ) : (
                    stores?.data?.map((store) => (
                        <SearchSelectItem key={store.id} value={`${store.id}`}>
                            {store.code} - {store.name}
                        </SearchSelectItem>
                    ))
                )}
            </SearchSelect>

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
                                    {ordersLoading ? (
                                        <Skeleton className="h-3 w-full rounded-lg" />
                                    ) : (
                                        '₹ ' + FormatNumber(lodashSumBy(cost, 'Cost'))
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
                                    {ordersLoading ? (
                                        <Skeleton className="h-3 w-full rounded-lg" />
                                    ) : (
                                        '₹ ' + FormatNumber(lodashSumBy(collected, 'Cost'))
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
                                    {ordersLoading ? (
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
                    <Text>Orders across stores will be displayed in realtime</Text>

                    <TextInput
                        value={orderSearch}
                        icon={MagnifyingGlassIcon}
                        onInput={(e) => setOrderSearch(e.currentTarget.value)}
                        placeholder="Search orders..."
                        className="my-2"
                    />

                    <div className="mt-2">
                        {ordersLoading ? (
                            <TableSkeleton numRows={5} numCols={8} />
                        ) : (
                            <>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Code</TableHeaderCell>
                                            <TableHeaderCell>Customer</TableHeaderCell>
                                            <TableHeaderCell>Order date</TableHeaderCell>
                                            <TableHeaderCell>Store code</TableHeaderCell>
                                            <TableHeaderCell>Due Date</TableHeaderCell>
                                            <TableHeaderCell>Status</TableHeaderCell>
                                            <TableHeaderCell>Amount</TableHeaderCell>
                                            <TableHeaderCell>Action</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ordersResponse?.data?.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.code}</TableCell>
                                                <TableCell>{order.customer?.name}</TableCell>
                                                <TableCell>
                                                    {dayjs(order.created_at).format('DD, MMMM YY')}
                                                </TableCell>
                                                <TableCell>{order.store?.code}</TableCell>
                                                <TableCell>
                                                    {order.due_date
                                                        ? dayjs(order.due_date).format(
                                                              'DD, MMMM YY',
                                                          )
                                                        : 'General'}
                                                </TableCell>
                                                <TableCell>{StatusBadger(order.status)}</TableCell>
                                                <TableCell>₹ {FormatNumber(order.cost)}</TableCell>
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
                                                            icon={ReceiptPercentIcon}
                                                        >
                                                            Show order
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {ordersResponse.meta.last_page > 1 && (
                                    <Flex justifyContent="end" className="mt-4">
                                        <Pagination
                                            total={ordersResponse.meta.last_page}
                                            onChange={setPage}
                                            page={page}
                                        />
                                    </Flex>
                                )}
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default isUser(ManagerIndex, ['manager'])
