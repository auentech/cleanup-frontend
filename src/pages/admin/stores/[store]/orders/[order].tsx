import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import {
    OrderGarment,
    OrderResponse,
    OrderService,
    OrderStatusesResponse,
    StoreResponse,
    UserData,
    Order,
} from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import Timeline from '@/components/timeline/timeline'
import TimelineItem from '@/components/timeline/timelineItem'
import {
    ArrowLeftIcon,
    BuildingStorefrontIcon,
    CameraIcon,
    ReceiptPercentIcon,
} from '@heroicons/react/24/outline'
import {
    Badge,
    Button,
    Card,
    Flex,
    Grid,
    Icon,
    List,
    ListItem,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from '@tremor/react'
import { Waveform } from '@uiball/loaders'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import OrderKPICards from '@/components/store/order/order-kpi-cards'
import OrderRemarks from '@/components/store/order/remarks'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sumBy from 'lodash/sumBy'
import { useQuery } from '@tanstack/react-query'
import TableSkeleton from '@/components/table-skeleton'
import Loading from '@/components/loading'

type Consolidate = {
    service: OrderService
    garment: OrderGarment
    quantity: number
    total: number
}

const ShowOrder = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData
    const storeID = router.query.store
    const orderID = router.query.order

    const [consolidate, setConsolidate] = useState<Consolidate[]>()

    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['admin stores order', storeID, orderID],
        queryFn: ({ signal }) =>
            axios.get<OrderResponse>('/stores/' + storeID + '/orders/' + orderID, {
                params: {
                    include: [
                        'customer.profile.state',
                        'customer.profile.district',
                        'orderItems.garment',
                        'orderItems.service',
                    ],
                },
                signal,
            }),
        select: (data) => data.data.data,
    })

    const { data: store } = useQuery({
        queryKey: ['admin stores', storeID],
        queryFn: ({ signal }) => axios.get<StoreResponse>('/stores/' + storeID, { signal }),
        select: (data) => data.data.data,
    })

    const { data: statuses, isLoading: statusesLoading } = useQuery({
        queryKey: ['admin stores order status', orderID],
        queryFn: ({ signal }) =>
            axios.get<OrderStatusesResponse>('/orders/' + orderID + '/status', {
                params: {
                    include: ['performer', 'performer.profile.state', 'performer.profile.district'],
                },
                signal,
            }),
        select: (data) => data.data.data,
    })

    useEffect(() => {
        if (!orderLoading) {
            const groupedOrders = groupBy(
                order?.items,
                (item) => `${item.garment.id}-${item.service.id}`,
            )
            const consolidatedOrders = map(groupedOrders, (gOrder) => {
                return {
                    service: gOrder[0].service,
                    garment: gOrder[0].garment,
                    total: sumBy(gOrder, 'cost'),
                    quantity: gOrder.length,
                }
            })

            setConsolidate(consolidatedOrders)
        }
    }, [order])

    return (
        <div className="p-12">
            <div>
                <Flex justifyContent="start">
                    <Icon
                        icon={ArrowLeftIcon}
                        onClick={() => router.back()}
                        style={{ cursor: 'pointer' }}
                    ></Icon>
                    <Title>{store?.name} store</Title>
                    <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">
                        {store?.code}
                    </Badge>
                </Flex>
                <Subtitle>
                    {order?.customer?.name}'order from {order?.customer?.profile?.address}
                </Subtitle>
            </div>

            <AdminNavigation />

            <Grid numItemsSm={2} numItemsLg={4} className="mt-6 gap-6">
                {!orderLoading && <OrderKPICards order={order as Order} />}
            </Grid>

            <div className="mt-6">
                <Card>
                    <Title>Order Items</Title>
                    <Text>All garments and services availed by this customer</Text>

                    {orderLoading ? (
                        <div className="mt-4">
                            <TableSkeleton numCols={6} numRows={5} />
                        </div>
                    ) : (
                        <Table className="mt-4">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>S.No</TableHeaderCell>
                                    <TableHeaderCell>Service</TableHeaderCell>
                                    <TableHeaderCell>Garment</TableHeaderCell>
                                    <TableHeaderCell>Quantity</TableHeaderCell>
                                    <TableHeaderCell>Cost</TableHeaderCell>
                                    <TableHeaderCell>Total</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consolidate?.map((item, index) => (
                                    <TableRow key={item.garment.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.service.service}</TableCell>
                                        <TableCell>{item.garment.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>₹ {item.garment.price_max}</TableCell>
                                        <TableCell>₹ {item.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>

            <Grid numItemsLg={2} className="mt-6 gap-6">
                <Card>
                    <Title>Customer details</Title>
                    <Text>Details of the customer the order belongs to</Text>

                    <div className="mt-4">
                        <List>
                            <ListItem>
                                <Text>Name</Text>
                                <Text>{order?.customer?.name}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Email</Text>
                                <Text>{order?.customer?.email}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Phone</Text>
                                <Text>{order?.customer?.phone}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Address</Text>
                                <Text>{order?.customer?.profile?.address}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Pincode</Text>
                                <Text>{order?.customer?.profile?.pincode}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>State</Text>
                                <Text>{order?.customer?.profile?.state.name}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>District</Text>
                                <Text>{order?.customer?.profile?.district.name}</Text>
                            </ListItem>
                        </List>
                    </div>
                </Card>

                <Card>
                    <Title>Order Actions</Title>
                    <Text>You can edit the order details. Do with care</Text>

                    <div className="mt-4">
                        <Flex flexDirection="col" className="gap-y-6">
                            <Link
                                href={
                                    process.env.NEXT_PUBLIC_BACKEND_URL +
                                    '/api/stores/' +
                                    storeID +
                                    '/orders/' +
                                    orderID +
                                    '/invoice?token=' +
                                    user.token
                                }
                                className="w-full"
                            >
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={ReceiptPercentIcon}
                                >
                                    Download Invoice
                                </Button>
                            </Link>
                            <Link
                                href={
                                    process.env.NEXT_PUBLIC_BACKEND_URL +
                                    '/api/stores/' +
                                    storeID +
                                    '/orders/' +
                                    orderID +
                                    '/qr?token=' +
                                    user.token
                                }
                                className="w-full"
                            >
                                <Button className="w-full" variant="secondary" icon={CameraIcon}>
                                    Download QR Codes
                                </Button>
                            </Link>
                        </Flex>
                    </div>
                </Card>
            </Grid>

            <div className="mt-6">{!orderLoading && <OrderRemarks order={order as Order} />}</div>

            <div className="mt-6">
                <Card>
                    <Title>Order timeline</Title>
                    {statusesLoading ? (
                        <div className="mt-4">
                            <Loading />
                        </div>
                    ) : (
                        <Timeline className="mt-4">
                            {statuses?.map((status) => (
                                <TimelineItem
                                    key={status.id}
                                    title={
                                        status.performer?.name + ' ' + status.action + ' the order'
                                    }
                                    date={dayjs(status.created_at).format('DD, MMMM YY')}
                                    text={
                                        'Action was performed at ' +
                                        dayjs(status.created_at).format('hh:mm A') +
                                        ' by ' +
                                        status.performer?.name +
                                        " who's role is " +
                                        status.performer?.role
                                    }
                                />
                            ))}
                        </Timeline>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default isUser(ShowOrder, ['admin'])
