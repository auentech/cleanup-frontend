import useAxios from "@/common/axios"
import { BackendGeneralResponse, FactoriesResponse, Factory, LoginResponse, OrdersResponse } from "@/common/types"
import { BeakerIcon, CheckBadgeIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline"
import { Badge, Button, Divider, Flex, List, ListItem, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, TextInput } from "@tremor/react"
import dayjs from "dayjs"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const CreateChallan = () => {
    const axios = useAxios()
    const router = useRouter()

    const [user, setUser] = useState<LoginResponse>()
    const [loading, setLoading] = useState<boolean>(false)
    const [orders, setOrders] = useState<OrdersResponse>()
    const [factories, setFactories] = useState<FactoriesResponse>()

    const [factorySearch, setFactorySearch] = useState<string>()

    const [selectedFactory, setSelectedFactory] = useState<Factory>()
    const [selectedOrders, setSelectedOrders] = useState<number[]>([])

    useEffect(() => {
        const fetchFactories = async () => {
            const factoriesResponse = await axios.get<FactoriesResponse>('/search/factory', {
                params: {
                    search: factorySearch
                }
            })

            setFactories(factoriesResponse.data)
        }

        fetchFactories()
    }, [factorySearch])

    useEffect(() => {
        const fetchOrders = async () => {
            const userResponse = await axios.get<LoginResponse>('user')

            setUser(userResponse.data)
            const storeID = userResponse.data.meta.store_id

            const challanlessOrderResponse = await axios.get<OrdersResponse>('/stores/' + storeID + '/orders', {
                params: {
                    filter: {
                        no_challans: 'lol',
                        originals: 'lol'
                    },
                    include: ['customer']
                }
            })

            setOrders(challanlessOrderResponse.data)
        }

        fetchOrders()
    }, [selectedFactory])

    const handleOrderSelection = (orderID: number) => {
        if (selectedOrders.includes(orderID)) {
            return
        }

        setSelectedOrders(oldValue => ([
            ...oldValue,
            orderID
        ]))
    }

    const isOrderSelected = (orderID: number) => selectedOrders.includes(orderID)

    const createDeliveryChallan = async () => {
        setLoading(true)

        await axios.post<BackendGeneralResponse>('stores/' + user?.meta.store_id + '/challans/', {
            factory_id: selectedFactory?.id,
            orders: selectedOrders,
        })

        alert('Delivery challan created successfully')
        setLoading(false)
        router.reload()
    }

    const NoChallanOrders = () => {
        return (
            <>
                <Table className="mt-4">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Order code</TableHeaderCell>
                            <TableHeaderCell>Customer name</TableHeaderCell>
                            <TableHeaderCell>Garments</TableHeaderCell>
                            <TableHeaderCell>Cost</TableHeaderCell>
                            <TableHeaderCell>Order created at</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.data.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>{order.code}</TableCell>
                                <TableCell>{order.customer?.name}</TableCell>
                                <TableCell>{order.count}</TableCell>
                                <TableCell>₹ {order.cost}</TableCell>
                                <TableCell>{dayjs(order.created_at).format('DD, MMMM YY')}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={e => handleOrderSelection(order.id)}
                                        icon={CheckBadgeIcon}
                                        variant='secondary'
                                        color={isOrderSelected(order.id) ? 'gray' : 'blue'}
                                        disabled={isOrderSelected(order.id)}
                                    >
                                        {
                                            isOrderSelected(order.id)
                                                ? 'Order selected'
                                                : 'Select order'
                                        }
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {selectedOrders.length > 0 && (
                    <>
                        <Divider />

                        <Flex justifyContent="end">
                            <Button
                                loading={loading}
                                variant="secondary"
                                icon={ReceiptPercentIcon}
                                onClick={e => createDeliveryChallan()}
                                loadingText="Creating delivery challan..."
                            >Create Delivery challan</Button>
                        </Flex>
                    </>
                )}
            </>
        )
    }

    return (
        <>
            {selectedFactory == undefined && (
                <>
                    <div className="mt-4">
                        <Text>Search factory</Text>
                        <TextInput className="mt-2" onInput={e => setFactorySearch(e.currentTarget.value)} />
                    </div>

                    <div className="mt-4">
                        <List>
                            {factories && (
                                factories.data.map(factory => (
                                    <ListItem key={factory.code}>
                                        <Flex justifyContent="start" className="gap-4">
                                            <span>{factory.name} - {factory.profile?.district.name}</span>
                                            <Badge icon={BeakerIcon}>{factory.code}</Badge>
                                        </Flex>
                                        <Button
                                            color="gray"
                                            variant="secondary"
                                            icon={CheckBadgeIcon}
                                            onClick={e => setSelectedFactory(factory)}
                                        >Select factory</Button>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </div>
                </>
            )}

            {selectedFactory && <NoChallanOrders />}
        </>
    )
}

export default CreateChallan
