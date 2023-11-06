import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { BackendGeneralResponse, OrderResponse, OrderStatusesResponse, StoreResponse, UserData } from "@/common/types"
import { ArrowLeftIcon, ArrowPathIcon, BuildingStorefrontIcon, CameraIcon, CurrencyRupeeIcon, ForwardIcon, ReceiptPercentIcon, ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Badge, Button, Card, Flex, Grid, Icon, List, ListItem, NumberInput, Select, Subtitle, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, TextInput, Title, SelectItem } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import OrderKPICards from "@/components/store/order/order-kpi-cards"
import OperatorNavigation from "@/components/operator/operator-navigation"
import OrderRemarks from "@/components/store/order/remarks"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/modal"
import { useDisclosure } from "@nextui-org/react"

const ShowOrderInfo = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData
    const storeID = router.query.store
    const orderID = router.query.order

    const [newCost, setNewCost] = useState<number>()
    const [loading, setLoading] = useState<boolean>(true)
    const [order, setOrder] = useState<OrderResponse>()
    const [store, setStore] = useState<StoreResponse>()
    const [editReason, setEditReason] = useState<string>()
    const [editLoading, setEditLoading] = useState<boolean>(false)
    const [statuses, setStatuses] = useState<OrderStatusesResponse>()
    const [balanceMode, setBalanceMode] = useState<'UPI' | 'Card' | 'Cash'>()

    const editModel = useDisclosure()
    const deliveryModal = useDisclosure()

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
            setNewCost(orderResponse.data.data.cost)

            setLoading(false)
        }

        getOrderDetails()
    }, [])

    const editOrder = async () => {
        setEditLoading(true)

        try {
            await axios.put<BackendGeneralResponse>('/stores/' + storeID + '/orders/' + orderID + '/cost', {
                cost: newCost,
                remarks: editReason,
            })

            alert('Made changes to order cost')
            router.reload()
        } catch (e) {
            alert('Unable to make change')
        } finally {
            setEditLoading(false)
        }
    }

    const OrderDisplay = () => (
        <>
            <div>
                <Flex justifyContent="start">
                    <Icon icon={ArrowLeftIcon} onClick={() => router.back()} style={{ cursor: 'pointer' }}></Icon>
                    <Title>{store?.data.name} store</Title>
                    <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">{store?.data.code}</Badge>
                </Flex>
                <Subtitle>{order?.data.customer?.name}' order from {order?.data.customer?.profile?.address}</Subtitle>

            </div>

            <OperatorNavigation />

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

            <Grid numItemsLg={3} className="gap-6 mt-6">
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
                        <Flex flexDirection="col" className="gap-y-4">
                            <a target="_blank" href={process.env.NEXT_PUBLIC_BACKEND_URL + '/api/stores/' + storeID + '/orders/' + orderID + '/invoice?token=' + user.token} className="w-full">
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={ReceiptPercentIcon}
                                >
                                    Download Invoice
                                </Button>
                            </a>
                            <a target="_blank" href={process.env.NEXT_PUBLIC_BACKEND_URL + '/api/stores/' + storeID + '/orders/' + orderID + '/qr?token=' + user.token} className="w-full">
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={CameraIcon}
                                >
                                    Download QR Codes
                                </Button>
                            </a>
                            <Link href="/operator/scanner" className="w-full">
                                <Button className="w-full" variant="secondary" icon={ArrowPathIcon}>
                                    Scan status
                                </Button>
                            </Link>
                            <Button
                                className="w-full"
                                icon={ForwardIcon}
                                variant="secondary"
                                onClick={editModel.onOpen}
                            >
                                Change order cost
                            </Button>
                            <Button
                                className="w-full"
                                icon={ShoppingBagIcon}
                                variant="secondary"
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
                                <Text>{order?.data.code}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Package</Text>
                                <Text>{order?.data.package}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Speed</Text>
                                <Text>{order?.data.speed}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Due on</Text>
                                <Text>{order?.data.due_date ? dayjs(order?.data.due_date).format('DD, MMMM YY') : 'General'}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>CGST</Text>
                                <Text>₹ {order?.data.cost && (order.data.cost * (9 / 100)).toFixed(2)}</Text>
                            </ListItem>
                            <ListItem>
                                <Text>SGST</Text>
                                <Text>₹ {order?.data.cost && (order.data.cost * (9 / 100)).toFixed(2)}</Text>
                            </ListItem>
                        </List>
                    </div>
                </Card>
            </Grid>

            <div className="mt-6">
                <OrderRemarks order={order as OrderResponse} />
            </div>

            <div className="mt-6">
                <Card>
                    <Title>Order timeline</Title>

                    <ol className="relative border-l border-gray-200 dark:border-gray-700 mt-4">
                        {statuses?.data.map(status => (
                            <li className="ml-4" key={status.id}>
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                    {dayjs(status.created_at).format('DD, MMMM YY')}
                                </time>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {status.performer?.name + ' ' + status.action + ' the order'}
                                </h3>
                                <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                                    {'Action was performed at ' + dayjs(status.created_at).format('hh:mm A') + ' by ' + status.performer?.name + ' who\'s role is ' + status.performer?.role}
                                    {status.data && (
                                        <>
                                            <br />
                                            {'Old cost was: ' + status.data.old + ' and the new cost is: ' + status.data.new}
                                            <br />
                                            {'Reason: ' + (status.data.remarks ?? 'Not entered')}
                                        </>
                                    )}
                                </p>
                                <br />
                            </li>
                        ))}
                    </ol>

                </Card>
            </div>

            <Modal isOpen={editModel.isOpen} onOpenChange={editModel.onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <Title>Order cost change</Title>
                            </ModalHeader>
                            <ModalBody>
                                <div className="mt-2">
                                    <Subtitle>New cost</Subtitle>
                                    <NumberInput
                                        icon={CurrencyRupeeIcon}
                                        value={newCost}
                                        onValueChange={setNewCost}
                                        enableStepper={false}
                                    />
                                </div>

                                <div className="mt-2">
                                    <Subtitle>Reason for change</Subtitle>
                                    <TextInput
                                        value={editReason}
                                        onInput={e => setEditReason(e.currentTarget.value)}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button icon={XMarkIcon} variant="secondary" color="red" onClick={onClose}>
                                    Close
                                </Button>
                                <Button icon={ForwardIcon} loading={editLoading} loadingText="Changing order cost..." onClick={e => editOrder()}>
                                    Change cost
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={deliveryModal.isOpen} scrollBehavior="inside" backdrop="blur" onOpenChange={deliveryModal.onOpenChange} classNames={{
                body: "pb-40",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <Title>Delivery order</Title>
                            </ModalHeader>
                            <ModalBody>
                                <p>
                                    Mark the order as delivered? Pending balance has to be paid if there is any.
                                </p>
                                {order?.data.cost != order?.data.paid && (
                                    <Select>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                    </Select>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button icon={XMarkIcon} variant="secondary" color="red" onClick={onClose}>
                                    Close
                                </Button>
                                <Button icon={ForwardIcon} loading={editLoading} loadingText="Marking as delivered...">
                                    Mark as delivered
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
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

export default isUser(ShowOrderInfo, ['operator'])
