import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { OrderResponse, OrderStatusesResponse, StoreResponse, UserData } from "@/common/types"
import Timeline from "@/components/timeline/timeline"
import TimelineItem from "@/components/timeline/timelineItem"
import { ArrowLeftIcon, BuildingStorefrontIcon, CameraIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline"
import { Badge, Button, Card, Flex, Grid, Icon, List, ListItem, Subtitle, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import OrderKPICards from "@/components/store/order/order-kpi-cards"
import OrderRemarks from "@/components/store/order/remarks"
import ManagerNavigation from "@/components/manager/manager-navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

const ShowOrder = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData
    const storeID = router.query.store
    const orderID = router.query.order

    const [loading, setLoading] = useState<boolean>(true)
    const [order, setOrder] = useState<OrderResponse>()
    const [store, setStore] = useState<StoreResponse>()
    const [statuses, setStatuses] = useState<OrderStatusesResponse>()

    useEffect(() => {
        const getOrderDetails = async () => {
            const orderResponse = await axios.get<OrderResponse>('/stores/' + storeID + '/orders/' + orderID, {
                params: {
                    include: [
                        'customer.profile.state',
                        'customer.profile.district',
                        'orderItems.garment',
                        'orderItems.service'
                    ]
                }
            })

            const storeResponse = await axios.get<StoreResponse>('/stores/' + storeID)
            const statusResponse = await axios.get<OrderStatusesResponse>('/orders/' + orderID + '/status', {
                params: {
                    include: [
                        'performer',
                        'performer.profile.state',
                        'performer.profile.district'
                    ]
                }
            })

            setOrder(orderResponse.data)
            setStore(storeResponse.data)
            setStatuses(statusResponse.data)

            setLoading(false)
        }

        getOrderDetails()
    }, [])

    const OrderDisplay = () => (
        <>
            <div>
                <Flex justifyContent="start">
                    <Icon icon={ArrowLeftIcon} onClick={() => router.back()} style={{ cursor: 'pointer' }}></Icon>
                    <Title>{store?.data.name} store</Title>
                    <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">{store?.data.code}</Badge>
                </Flex>
                <Subtitle>{order?.data.customer?.name}'order from {order?.data.customer?.profile?.address}</Subtitle>

            </div>

            <ManagerNavigation />

            <Grid numItemsSm={2} numItemsLg={4} className="gap-6 mt-6">
                <OrderKPICards order={order} />
            </Grid>

            <div className="mt-6">
                <Card>
                    <Title>Order Items</Title>
                    <Text>All garments and services availed by this customer</Text>

                    <Table className="mt-4">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Service</TableHeaderCell>
                                <TableHeaderCell>Garment</TableHeaderCell>
                                <TableHeaderCell>Cost</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {order?.data.items?.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.service.service}</TableCell>
                                    <TableCell>{item.garment.name}</TableCell>
                                    <TableCell>₹ {item.garment.price_max}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Grid numItemsLg={2} className="gap-6 mt-6">
                <Card>
                    <Title>Customer details</Title>
                    <Text>Details of the customer the order belongs to</Text>

                    <div className="mt-4">
                        <List>
                            <ListItem>
                                <Text>Name</Text>
                                <Text>{order?.data.customer?.name}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Email</Text>
                                <Text>{order?.data.customer?.email}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Phone</Text>
                                <Text>{order?.data.customer?.phone}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Address</Text>
                                <Text>{order?.data.customer?.profile?.address}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Pincode</Text>
                                <Text>{order?.data.customer?.profile?.pincode}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>State</Text>
                                <Text>{order?.data.customer?.profile?.state.name}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>District</Text>
                                <Text>{order?.data.customer?.profile?.district.name}</Text>
                            </ListItem>
                        </List>
                    </div>
                </Card>

                <Card>
                    <Title>Order Actions</Title>
                    <Text>You can edit the order details. Do with care</Text>

                    <div className="mt-4">
                        <Flex flexDirection="col" className="gap-y-6">
                            <Link href={process.env.NEXT_PUBLIC_BACKEND_URL + '/api/stores/' + storeID + '/orders/' + orderID + '/invoice?token=' + user.token} className="w-full">
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={ReceiptPercentIcon}
                                >
                                    Download Invoice
                                </Button>
                            </Link>
                            <Link href={process.env.NEXT_PUBLIC_BACKEND_URL + '/api/stores/' + storeID + '/orders/' + orderID + '/qr?token=' + user.token} className="w-full">
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={CameraIcon}
                                >
                                    Download QR Codes
                                </Button>
                            </Link>
                        </Flex>
                    </div>
                </Card>
            </Grid>

            <div className="mt-6">
                <OrderRemarks order={order as OrderResponse} />
            </div>

            <div className="mt-6">
                <Card>
                    <Title>Order timeline</Title>
                    <Timeline className="mt-4">
                        {statuses?.data.map(status => (
                            <TimelineItem
                                key={status.id}
                                title={status.performer?.name + ' ' + status.action + ' the order'}
                                date={dayjs(status.created_at).format('DD, MMMM YY')}
                                text={'Action was performed at ' + dayjs(status.created_at).format('hh:mm A') + ' by ' + status.performer?.name + ' who\'s role is ' + status.performer?.role}
                            />
                        ))}
                    </Timeline>
                </Card>
            </div>
        </>
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
                        <div className="h-60" />
                    </Flex>
                </Card>
            ) : <OrderDisplay />}
        </div>
    )
}

export default isUser(ShowOrder, ['manager'])
