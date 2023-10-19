import useAxios from "@/common/axios"
import { BackendGeneralResponse, FactoriesResponse, Factory, LoginResponse, OrdersResponse } from "@/common/types"
import { BeakerIcon, CheckBadgeIcon, TruckIcon } from "@heroicons/react/24/outline"
import { Table, TableHead, TableRow, Text, TableHeaderCell, TableBody, TableCell, Divider, Button, Flex, Badge, List, ListItem, TextInput } from "@tremor/react"
import dayjs from "dayjs"
import Link from "next/link"
import router from "next/router"
import { useEffect, useState } from "react"

const RewashChallans = () => {
    const axios = useAxios()

    const [user, setUser] = useState<LoginResponse>()
    const [orders, setOrders] = useState<OrdersResponse>()
    const [loading, setLoading] = useState<boolean>(false)
    const [factorySearch, setFactorySearch] = useState<string>()
    const [factories, setFactories] = useState<FactoriesResponse>()
    const [selectedFactory, setSelectedFactory] = useState<Factory>()

    useEffect(() => {
        const fetchRewashes = async () => {
            const userResponse = await axios.get<LoginResponse>('user')
            setUser(userResponse.data)

            const rewashesResponse = await axios.get<OrdersResponse>('/stores/' + userResponse.data.meta.store_id + '/orders', {
                params: {
                    filter: {
                        no_challans: 'lol',
                        rewash: 'lol'
                    },
                    include: ['customer', 'rewash']
                }
            })

            setOrders(rewashesResponse.data)
        }

        fetchRewashes()
    }, [])

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

    const handleCreateChallan = async () => {
        setLoading(true)

        const selectedOrders = orders?.data.map(order => order.id)
        await axios.post<BackendGeneralResponse>('stores/' + user?.meta.store_id + '/challans/', {
            factory_id: selectedFactory?.id,
            orders: selectedOrders,
        })

        alert('Delivery challan created successfully')
        setLoading(false)

        router.reload()
    }

    const NoChallanOrders = () => (
        <>
            <Table className="mt-4">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Order code</TableHeaderCell>
                        <TableHeaderCell>Customer name</TableHeaderCell>
                        <TableHeaderCell>Garments</TableHeaderCell>
                        <TableHeaderCell>Origianl order</TableHeaderCell>
                        <TableHeaderCell>Order created at</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders?.data.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.code}</TableCell>
                            <TableCell>{order.customer?.name}</TableCell>
                            <TableCell>{order.count}</TableCell>
                            <TableCell>
                                <Link href={'/operator/stores/' + user?.meta.store_id + '/orders/' + order.rewash?.code}>
                                    <Text color="blue">{order.rewash?.code}</Text>
                                </Link>
                            </TableCell>
                            <TableCell>{dayjs(order.created_at).format('DD, MMMM YY')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {orders && (
                <>
                    <Divider />

                    <Flex justifyContent="end">
                        <Button
                            loading={loading}
                            icon={TruckIcon}
                            variant="secondary"
                            onClick={() => handleCreateChallan()}
                            loadingText="Creating delivery challan for rewashes..."
                        >Create challan for all</Button>
                    </Flex>
                </>
            )}
        </>
    )

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

export default RewashChallans
