import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import {
    BackendGeneralResponse,
    Order,
    OrderGarment,
    OrderResponse,
    OrderService,
    OrderStatusesResponse,
    PaymentMode,
    StoreResponse,
    UserData,
} from '@/common/types'
import {
    ArrowLeftIcon,
    BuildingStorefrontIcon,
    CameraIcon,
    ForwardIcon,
    ReceiptPercentIcon,
    ShoppingBagIcon,
    XMarkIcon,
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
    Select,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
    SelectItem,
} from '@tremor/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import OrderKPICards from '@/components/store/order/order-kpi-cards'
import OperatorNavigation from '@/components/operator/operator-navigation'
import OrderRemarks from '@/components/store/order/remarks'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/modal'
import { useDisclosure } from '@nextui-org/react'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sumBy from 'lodash/sumBy'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import TableSkeleton from '@/components/table-skeleton'
import Loading from '@/components/loading'
import { toast } from 'react-toastify'

type Consolidate = {
    service: OrderService
    garment: OrderGarment
    quantity: number
    total: number
}

const ShowOrderInfo = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()
    const queryClient = useQueryClient()

    const user = data?.user as UserData
    const storeID = parseInt(router.query.store as string)
    const orderID = router.query.order

    const [balanceMode, setBalanceMode] = useState<PaymentMode>('Cash')
    const [consolidate, setConsolidate] = useState<Consolidate[]>()

    const deliveryModal = useDisclosure()

    const {
        isLoading: isStoreLoading,
        isError: isStoreError,
        data: store,
    } = useQuery({
        queryKey: ['stores', storeID],
        queryFn: ({ signal }) => axios.get<StoreResponse>('/stores/' + storeID, { signal }),
    })

    const {
        isLoading: isOrderLoading,
        isError: isOrderError,
        data: order,
    } = useQuery({
        queryKey: ['orders', orderID],
        queryFn: ({ signal }) =>
            axios.get<OrderResponse>('/stores/' + storeID + '/orders/' + orderID, {
                signal,
                params: {
                    include: [
                        'customer.profile.state',
                        'customer.profile.district',
                        'orderItems.garment',
                        'orderItems.service',
                    ],
                },
            }),
    })

    const {
        isLoading: isStatusesLoading,
        isError: isStatusesError,
        data: statuses,
    } = useQuery({
        queryKey: ['orders', orderID, 'status'],
        queryFn: ({ signal }) =>
            axios.get<OrderStatusesResponse>('/orders/' + orderID + '/status', {
                signal,
                params: {
                    include: ['performer', 'performer.profile.state', 'performer.profile.district'],
                },
            }),
    })

    useEffect(() => {
        if (isStoreError) {
            toast.error('Unable to load store information')
        }

        if (isOrderError) {
            toast.error('Unable to load order information')
        }

        if (isStatusesError) {
            toast.error('Unable to load order statuses')
        }
    }, [isStoreError, isOrderError, isStatusesError])

    useEffect(() => {
        const groupedOrders = groupBy(
            order?.data?.data.items,
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
    }, [order])

    const deliverOrder = useMutation({
        mutationFn: () =>
            axios.put<BackendGeneralResponse>(
                '/stores/' + storeID + '/orders/' + orderID + '/deliver',
                {
                    mode: balanceMode,
                },
            ),
        onSuccess: () => {
            toast.success('Delivered order successfully')
            queryClient.invalidateQueries({
                queryKey: ['orders', orderID],
            })
            queryClient.invalidateQueries({
                queryKey: ['orders', orderID, 'status'],
            })
        },
        onError: () => {
            toast.error('Unable to deliver order')
        },
        onSettled: () => {
            deliveryModal.onClose()
        },
    })

    return (
        <div className="p-12">
            <div>
                <Flex justifyContent="start">
                    <Icon
                        icon={ArrowLeftIcon}
                        onClick={() => router.back()}
                        style={{ cursor: 'pointer' }}
                    ></Icon>
                    <Title>
                        {isStoreLoading ? 'Loading...' : `${store?.data.data.name} store`}
                    </Title>
                    <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">
                        {isStoreLoading ? 'Loading...' : `${store?.data.data.code}`}
                    </Badge>
                </Flex>
                <Subtitle>
                    {isOrderLoading
                        ? 'Loading...'
                        : `${order?.data.data.customer?.name}'s order from${' '}
                    ${order?.data.data.customer?.profile?.address}`}
                </Subtitle>
            </div>

            <OperatorNavigation />

            {isOrderLoading ? (
                <Card className="mt-6">
                    <Loading />
                </Card>
            ) : (
                <Grid numItemsSm={2} numItemsLg={4} className="mt-6 gap-6">
                    <OrderKPICards order={order?.data.data as Order} />
                </Grid>
            )}

            <div className="mt-6">
                <Card>
                    <Title>Order Items</Title>
                    <Text>All garments and services availed by this customer</Text>

                    {isOrderLoading ? (
                        <TableSkeleton numRows={5} numCols={6} />
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

            <Grid numItemsLg={3} className="mt-6 gap-6">
                <Card>
                    <Title>Customer details</Title>
                    <Text>Details of the customer the order belongs to</Text>

                    <div className="mt-4">
                        <List>
                            <ListItem>
                                <Text>Name</Text>
                                <Text>{order?.data.data.customer?.name}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Email</Text>
                                <Text>{order?.data.data.customer?.email}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Phone</Text>
                                <Text>{order?.data.data.customer?.phone}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Address</Text>
                                <Text>{order?.data.data.customer?.profile?.address}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Pincode</Text>
                                <Text>{order?.data.data.customer?.profile?.pincode}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>State</Text>
                                <Text>{order?.data.data.customer?.profile?.state.name}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>District</Text>
                                <Text>{order?.data.data.customer?.profile?.district.name}</Text>
                            </ListItem>
                        </List>
                    </div>
                </Card>

                <Card>
                    <Title>Order Actions</Title>
                    <Text>You can edit the order details. Do with care</Text>

                    <div className="mt-4">
                        <Flex flexDirection="col" className="gap-y-4">
                            <a
                                target="_blank"
                                href={
                                    process.env.NEXT_PUBLIC_BACKEND_URL +
                                    'api/stores/' +
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
                            </a>
                            <a
                                target="_blank"
                                href={
                                    process.env.NEXT_PUBLIC_BACKEND_URL +
                                    'api/stores/' +
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
                            </a>
                            <Link
                                href={`/operator/stores/${storeID}/orders/${orderID}/edit`}
                                className="w-full"
                            >
                                <Button
                                    className="w-full"
                                    icon={ForwardIcon}
                                    variant="secondary"
                                    disabled={!!order?.data.data.delivery_challan_id}
                                >
                                    Edit order
                                </Button>
                            </Link>
                            <Button
                                className="w-full"
                                icon={ShoppingBagIcon}
                                variant="secondary"
                                disabled={
                                    !['processed', 'in_store'].includes(
                                        order?.data.data.status as string,
                                    )
                                }
                                onClick={deliveryModal.onOpen}
                            >
                                Give for delivery
                            </Button>
                        </Flex>
                    </div>
                </Card>

                <Card>
                    <Title>Order Details</Title>
                    <Text>Get a glimpse of order related information</Text>

                    <div className="mt-4">
                        <List>
                            <ListItem>
                                <Text>Code</Text>
                                <Text>{order?.data.data.code}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Package</Text>
                                <Text>{order?.data.data.package}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Speed</Text>
                                <Text>
                                    {order?.data.data.speed == 0
                                        ? 'General delivery'
                                        : order?.data.data.speed + ' day delivery'}
                                </Text>
                            </ListItem>
                            <ListItem>
                                <Text>Due on</Text>
                                <Text>
                                    {order?.data.data.due_date
                                        ? dayjs(order?.data.data.due_date).format('DD, MMMM YY')
                                        : 'General'}
                                </Text>
                            </ListItem>
                            <ListItem>
                                <Text>CGST</Text>
                                <Text>
                                    ₹{' '}
                                    {order?.data.data.cost &&
                                        (order.data.data.cost * (9 / 100)).toFixed(2)}
                                </Text>
                            </ListItem>
                            <ListItem>
                                <Text>SGST</Text>
                                <Text>
                                    ₹{' '}
                                    {order?.data.data.cost &&
                                        (order.data.data.cost * (9 / 100)).toFixed(2)}
                                </Text>
                            </ListItem>
                            <ListItem>
                                <Text>First installment mode</Text>
                                <Text>{order?.data.data.mode}</Text>
                            </ListItem>
                        </List>
                    </div>
                </Card>
            </Grid>

            <div className="mt-6">
                {isOrderLoading || isOrderError ? (
                    <Card>
                        <Loading />
                    </Card>
                ) : (
                    <OrderRemarks order={order?.data.data as Order} />
                )}
            </div>

            <div className="mt-6">
                <Card>
                    <Title>Order timeline</Title>

                    {isStatusesLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <Subtitle>
                                Washed: {order?.data.meta?.washedCount} | Ironed:{' '}
                                {order?.data.meta?.ironedCount}
                            </Subtitle>

                            <ol className="relative mt-4 border-l border-gray-200 dark:border-gray-700">
                                {statuses?.data.data.map((status) => (
                                    <li className="ml-4" key={status.id}>
                                        <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"></div>
                                        <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                            {dayjs(status.created_at).format('DD, MMMM YY')}
                                        </time>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {status.performer?.name +
                                                ' ' +
                                                status.action +
                                                ' the order'}
                                        </h3>
                                        <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                                            {'Action was performed at ' +
                                                dayjs(status.created_at).format('hh:mm A') +
                                                ' by ' +
                                                status.performer?.name +
                                                " who's role is " +
                                                status.performer?.role}
                                        </p>
                                        <br />
                                    </li>
                                ))}
                            </ol>
                        </>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={deliveryModal.isOpen}
                scrollBehavior="inside"
                backdrop="blur"
                onOpenChange={deliveryModal.onOpenChange}
                classNames={{
                    body: 'pb-40',
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <Title>Delivery order</Title>
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    Mark the order as delivered? Pending balance has to be paid if
                                    there is any.
                                </p>
                                {order?.data.data.cost != order?.data.data.paid && (
                                    <Select
                                        enableClear={false}
                                        value={balanceMode}
                                        onValueChange={(mode) =>
                                            setBalanceMode(mode as PaymentMode)
                                        }
                                    >
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                    </Select>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    icon={XMarkIcon}
                                    variant="secondary"
                                    color="red"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    icon={ForwardIcon}
                                    loading={deliverOrder.isPending}
                                    loadingText="Marking as delivered..."
                                    onClick={(_) => deliverOrder.mutate()}
                                >
                                    Mark as delivered
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default isUser(ShowOrderInfo, ['operator'])
