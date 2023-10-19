import useAxios from "@/common/axios"
import { BackendGeneralResponse, LoginResponse, Order, OrderItem, OrderResponse, OrdersResponse } from "@/common/types"
import { CheckBadgeIcon, ReceiptPercentIcon, ReceiptRefundIcon } from "@heroicons/react/24/outline"
import { Button, Callout, Divider, Flex, List, ListItem, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, TextInput } from "@tremor/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

type CreateRewashType = {
    user: LoginResponse
}

type CreateRewashQuery = {
    order: string
}

const CreateRewash = ({ user }: CreateRewashType) => {
    const router = useRouter()
    const axios = useAxios()

    const query = router.query as CreateRewashQuery

    const [search, setSearch] = useState<string>()
    const [orders, setOrders] = useState<OrdersResponse>()

    const [selectedOrder, setSelectedOrder] = useState<Order>()
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    useEffect(() => {
        const fetchOrders = async () => {
            const ordersResponse = await axios.get<OrdersResponse>('search/store/' + user.meta.store_id + '/order', {
                params: { search }
            })

            const filtered: OrdersResponse = {
                data: ordersResponse.data.data.filter(order => !order.rewash_parent_id),
                links: ordersResponse.data.links,
                meta: ordersResponse.data.meta,
            }

            setOrders(filtered)
        }

        fetchOrders()
    }, [search])

    useEffect(() => {
        if (!query?.order) {
            return
        }

        try {
            const fetchOrder = async () => {
                const orderResponse = await axios.get<OrderResponse>('/stores/' + user?.meta?.store_id + '/orders/' + query.order, {
                    params: {
                        include: [
                            'orderItems.garment',
                            'orderItems.service'
                        ]
                    }
                })
                setSelectedOrder(orderResponse.data.data)
            }

            fetchOrder()
        } catch {
            //
        }
    }, [query.order])

    const handleItemSelection = (item: OrderItem) => {
        if (selectedItems.includes(item.id)) {
            return
        }

        setSelectedItems(oldValues => ([
            ...oldValues,
            item.id
        ]))
    }

    const isItemSelected = (item: OrderItem) => selectedItems.includes(item.id)

    const handleCreateRewash = async () => {
        const response = await axios.post<BackendGeneralResponse>('stores/' + user.meta.store_id + '/orders/rewash', {
            order_id: selectedOrder?.id,
            items: selectedItems,
        })

        alert(response.data.message)
        router.reload()
    }

    return (
        <>
            {selectedOrder == undefined && (
                <>
                    <div className="mt-4">
                        <Text>Search orders</Text>
                        <TextInput onInput={e => setSearch(e.currentTarget.value)} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <List>
                            {orders?.data.map(order => (
                                <ListItem key={order.id}>
                                    {order.customer?.name} - {order.code}
                                    <Button
                                        size="xs"
                                        color="gray"
                                        variant="secondary"
                                        icon={ReceiptPercentIcon}
                                        onClick={e => setSelectedOrder(order)}
                                    >Select order</Button>
                                </ListItem>
                            ))}
                        </List>
                    </div>
                </>
            )}

            {selectedOrder && (
                <>
                    <div className="mt-4">
                        <Callout title={"Rewash for " + selectedOrder.code}>
                            Order of {selectedOrder.customer?.name} with code {selectedOrder.code} will be given for rewash
                        </Callout>
                    </div>

                    <div className="mt-4">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Service</TableHeaderCell>
                                    <TableHeaderCell style={{ textAlign: 'center' }}>Garment</TableHeaderCell>
                                    <TableHeaderCell style={{ textAlign: 'center' }}>Action</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedOrder.items?.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.service?.service}</TableCell>
                                        <TableCell>
                                            <Flex justifyContent="center">
                                                {item.garment?.name}
                                            </Flex>
                                        </TableCell>
                                        <TableCell>
                                            <Flex justifyContent="center">
                                                <Button
                                                    onClick={e => handleItemSelection(item)}
                                                    disabled={isItemSelected(item)}
                                                    icon={CheckBadgeIcon}
                                                    variant="secondary"
                                                    color={isItemSelected(item) ? "gray" : 'blue'}
                                                >{isItemSelected(item) ? 'Item selected' : 'Select Item'}</Button>
                                            </Flex>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

            {selectedItems.length > 0 && (
                <>
                    <Divider />
                    <Flex justifyContent="end">
                        <Button
                            variant="secondary"
                            icon={ReceiptRefundIcon}
                            onClick={e => handleCreateRewash()}
                        >Create rewash</Button>
                    </Flex>
                </>
            )}
        </>
    )
}

export default CreateRewash
