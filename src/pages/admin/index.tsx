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
    Button,
    SearchSelect,
    SearchSelectItem,
    Divider,
    Col,
    DatePicker,
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
import { Pagination, Skeleton } from '@nextui-org/react'
import FormatNumber from '@/common/number-formatter'
import StatusBadger from '@/common/status-badger'
import { useDebounce } from 'use-debounce'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import * as Next from '@nextui-org/react'
import dayjsUTC from 'dayjs/plugin/utc'
import Loading from '@/components/loading'

type SortDescriptor = {
    column?: any
    direction?: SortDirection
}

type SortDirection = 'ascending' | 'descending'

type SalesMetricType = {
    date: string
    Cost: number
}

type OrdersMetricType = {
    date: string
    Orders: number
}

const AdminIndex = () => {
    dayjs.extend(dayjsUTC)

    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [cost, setCost] = useState<SalesMetricType[]>()
    const [orders, setOrders] = useState<OrdersMetricType[]>()
    const [dueDate, setDueDate] = useState<Date>()
    const [collected, setCollected] = useState<SalesMetricType[]>()
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()

    const [storeSearch, setStoreSearch] = useState<string>('')
    const [storeSearchBounced] = useDebounce<string>(storeSearch, 500)

    const [orderSearch, setOrderSearch] = useState<string>('')
    const [orderSearchBounced] = useDebounce<string>(orderSearch, 500)

    const [page, setPage] = useState<number>(1)
    const [selectedStore, setSelectedStore] = useState<Store>()

    const getOrders = async (signal: AbortSignal): Promise<OrdersResponse> => {
        let params: { [key: string]: any } = {
            page,
            search: orderSearchBounced,
            filter: {
                store_id: selectedStore?.id,
            },
            include: ['customer', 'store'],
            sort:
                sortDescriptor?.direction == 'descending'
                    ? `-${sortDescriptor.column}`
                    : sortDescriptor?.column,
        }

        if (dueDate != undefined) {
            params.filter = {
                ...params.filter,
                due_date: dayjs(dueDate).utc().format('YYYY-MM-DD'),
            }
        }

        const endpoint = orderSearchBounced == '' ? 'orders/god-view' : 'search/admin/order'
        const data = await axios.get<OrdersResponse>(endpoint, { params, signal })

        return data.data
    }

    const {
        isLoading: ordersFirstLoad,
        isFetching: ordersFetching,
        isError: ordersError,
        data: ordersResponse,
    } = useQuery({
        placeholderData: keepPreviousData,
        queryKey: [
            'admin dashboard',
            selectedStore?.id,
            orderSearchBounced,
            page,
            sortDescriptor,
            dueDate,
        ],
        queryFn: ({ signal }) => getOrders(signal),
    })

    const {
        data: metricsResponse,
        isLoading: metricsLoading,
        isError: metricsError,
    } = useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['admin metrics', selectedStore?.id],
        queryFn: ({ signal }) =>
            axios.get<GodMetricsResponse>('dashboard/god-metrics', {
                params: {
                    store_id: selectedStore?.id,
                },
                signal,
            }),
        select: (data) => data.data
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
        const data: SalesMetricType[] = lodashMap(metricsResponse?.billing, (theMetrics, date) => {
            return {
                date,
                Cost: theMetrics,
            }
        })

        setCost(lodashReverse(lodashSortBy(data, 'date')))
    }

    const calculateCollected = () => {
        const data: SalesMetricType[] = lodashMap(
            metricsResponse?.collections,
            (theMetrics, date) => {
                return {
                    date,
                    Cost: theMetrics,
                }
            },
        )

        setCollected(lodashReverse(lodashSortBy(data, 'date')))
    }

    const calculateOrders = () => {
        const data: OrdersMetricType[] = lodashMap(metricsResponse?.orders, (theMetrics, date) => {
            return {
                date,
                Orders: theMetrics,
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
                Admin dashboard for Cleanup{' '}
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
                                    {ordersFirstLoad ? (
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
                                    {ordersFirstLoad ? (
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
                                    {ordersFirstLoad ? (
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

            <div>
                <Divider />

                <Title>Live orders</Title>
                <Text>Orders across stores will be displayed in realtime</Text>

                <Grid numItemsMd={12} className="mb-4 mt-4 gap-6">
                    <Col numColSpanMd={8}>
                        <TextInput
                            value={orderSearch}
                            icon={MagnifyingGlassIcon}
                            onInput={(e) => setOrderSearch(e.currentTarget.value)}
                            placeholder="Search orders..."
                            disabled={dueDate != undefined}
                        />
                    </Col>
                    <Col numColSpanMd={4}>
                        <DatePicker
                            placeholder="Due Date"
                            onValueChange={setDueDate}
                            value={dueDate}
                            enableClear
                        />
                    </Col>
                </Grid>

                <div className="mt-2">
                    <Next.Table
                        onSortChange={setSortDescriptor}
                        sortDescriptor={sortDescriptor}
                        bottomContent={
                            ordersResponse?.meta.last_page! > 1 && (
                                <Flex justifyContent="center">
                                    <Pagination
                                        total={ordersResponse?.meta?.last_page!}
                                        onChange={setPage}
                                        page={page}
                                    />
                                </Flex>
                            )
                        }
                        classNames={{
                            table: "min-h-[420px]",
                        }}
                    >
                        <Next.TableHeader>
                            <Next.TableColumn key="code">Code</Next.TableColumn>
                            <Next.TableColumn key="customer">Customer</Next.TableColumn>
                            <Next.TableColumn key="created_at" allowsSorting>
                                Order Date
                            </Next.TableColumn>
                            <Next.TableColumn key="store_code">Store Code</Next.TableColumn>
                            <Next.TableColumn key="due_date" allowsSorting>
                                Due Date
                            </Next.TableColumn>
                            <Next.TableColumn key="status">Status</Next.TableColumn>
                            <Next.TableColumn key="cost" allowsSorting>
                                Amount
                            </Next.TableColumn>
                            <Next.TableColumn key="action">Action</Next.TableColumn>
                        </Next.TableHeader>
                        <Next.TableBody
                            items={ordersFetching ? [] : ordersResponse?.data}
                            isLoading={ordersFetching}
                            loadingContent={<div className='my-46'><Loading /></div>}
                        >
                            {(item) => (
                                <Next.TableRow key={item.id}>
                                    <Next.TableCell>{item.code}</Next.TableCell>
                                    <Next.TableCell>{item.customer?.name}</Next.TableCell>
                                    <Next.TableCell>
                                        {dayjs(item.created_at).format('DD, MMMM YY')}
                                    </Next.TableCell>
                                    <Next.TableCell>{item.store?.code}</Next.TableCell>
                                    <Next.TableCell>
                                        {item.due_date
                                            ? dayjs(item.due_date).format('DD, MMMM YY')
                                            : 'General'}
                                    </Next.TableCell>
                                    <Next.TableCell>
                                        {StatusBadger(item.status)}
                                    </Next.TableCell>
                                    <Next.TableCell>
                                        ₹ {FormatNumber(item.cost)}
                                    </Next.TableCell>
                                    <Next.TableCell>
                                        <Link
                                            href={
                                                '/admin/stores/' +
                                                item.store?.id +
                                                '/orders/' +
                                                item.code
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
                                    </Next.TableCell>
                                </Next.TableRow>
                            )}
                        </Next.TableBody>
                    </Next.Table>
                </div>
            </div>
        </div>
    )
}

export default isUser(AdminIndex, ['admin'])
