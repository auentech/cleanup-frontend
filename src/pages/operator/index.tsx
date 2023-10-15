import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { LoginResponse, OrdersResponse, StoreResponse, UserData } from "@/common/types"
import OperatorNavigation from "@/components/operator/operator-navigation"
import StoreKPICards from "@/components/store/store-kpi-cards"
import StoreOrders from "@/components/store/store-orders"
import { Title, Text, Italic, Grid, Card, TabList, TabGroup, Tab, TabPanels, TabPanel, Flex } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const LazyCreateOrder = dynamic(() => import('@/components/store/order/create-order'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const OperatorIndex = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [index, setIndex] = useState<number>(0)
    const [store, setStore] = useState<StoreResponse>()
    const [orders, setOrders] = useState<OrdersResponse>()

    useEffect(() => {
        const fetchData = async () => {
            const userResponse = await axios.get<LoginResponse>('/user/')
            const storeID = userResponse.data.meta.store_id

            const storeResponse = await axios.get<StoreResponse>('/stores/' + storeID, {
                params: {
                    include: [
                        'profile.state',
                        'profile.district',

                        'operators.user',
                        'operators.user.profile.state',
                        'operators.user.profile.district'
                    ]
                }
            })

            const ordersResponse = await axios.get<OrdersResponse>('/stores/' + storeID + '/orders', {
                params: {
                    include: ['customer']
                },
            })

            setStore(storeResponse.data)
            setOrders(ordersResponse.data)
        }

        fetchData()
    }, [])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Operator dashboard for {store?.data.name} {' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Grid numItemsMd={3} className="gap-6">
                    <StoreKPICards store={store} />
                </Grid>
            </div>

            <Card className="mt-6">
                <Title>Orders</Title>
                <Text>All the orders in your store</Text>
                <TabGroup className="mt-4" onIndexChange={setIndex}>
                    <TabList>
                        <Tab>List orders</Tab>
                        <Tab>Create order</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <StoreOrders store={store} orders={orders} />
                        </TabPanel>
                        <TabPanel>
                            {index == 1 && <LazyCreateOrder store={store as StoreResponse} />}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
        </div>
    )
}

export default isUser(OperatorIndex, ['operator'])
