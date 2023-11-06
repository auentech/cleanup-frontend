import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { OrdersResponse, Store, StoreResponse } from "@/common/types"
import { ArrowLeftIcon, BuildingStorefrontIcon, MoonIcon, PencilIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline"
import { Badge, Card, Flex, Grid, Icon, Tab, TabGroup, TabList, TabPanel, TabPanels, Text, Title } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import AdminNavigation from "@/components/admin/admin-navigation"
import dynamic from "next/dynamic"
import StoreKPICards from "@/components/store/store-kpi-cards"
import StoreOrders from "@/components/store/store-orders"

const LazyEditStore = dynamic(() => import('@/components/admin/edit-store'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const LazyClosingsList = dynamic(() => import('@/components/store/store-closings'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const ShowStore = () => {
    const axios = useAxios()
    const router = useRouter()

    const [theIndex, setTheIndex] = useState<number>(0)
    const [store, setStore] = useState<StoreResponse>()
    const [loading, setLoading] = useState<boolean>(true)
    const [orders, setOrders] = useState<OrdersResponse>()

    useEffect(() => {
        (async () => {
            const storeResponse = await axios.get<StoreResponse>('/stores/' + router.query.store, {
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

            const ordersResponse = await axios.get<OrdersResponse>('/stores/' + router.query.store + '/orders', {
                params: {
                    include: ['customer'],
                    filter: {
                        originals: 'yes'
                    }
                },
            })

            setStore(storeResponse.data)
            setOrders(ordersResponse.data)

            setLoading(false)
        })()
    }, [])

    const StoreBody = () => (
        <div>
            <Flex justifyContent="start">
                <Icon icon={ArrowLeftIcon} onClick={() => router.back()} style={{ cursor: 'pointer' }}></Icon>
                <Title>{store?.data.name} store</Title>
                <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">{store?.data.code}</Badge>
            </Flex>
            <Text>Store located at: {store?.data?.profile?.address}</Text>

            <AdminNavigation />

            <div className="mt-6">
                <Grid numItemsLg={4} numItemsMd={2} className="gap-6">
                    {store != undefined && <StoreKPICards store={store} />}
                </Grid>
            </div>

            <div className="mt-6">
                <Card>
                    <TabGroup index={theIndex} onIndexChange={setTheIndex}>
                        <TabList variant="solid">
                            <Tab icon={ReceiptPercentIcon}>Orders</Tab>
                            <Tab icon={PencilIcon}>Settings</Tab>
                            <Tab icon={MoonIcon}>Closings</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel className="mt-6">
                                <Title>Orders</Title>
                                <Text>All the orders in your store</Text>

                                <div className="mt-4">
                                    <StoreOrders store={store} orders={orders} role="admin" />
                                </div>
                            </TabPanel>

                            <TabPanel className="mt-6">
                                <Title>Edit store</Title>
                                <Text>Did not like something? Time to change that</Text>

                                {theIndex == 1 && <LazyEditStore />}
                            </TabPanel>

                            <TabPanel className="mt-6">
                                {theIndex == 2 && <LazyClosingsList store={store?.data as Store} />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
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
                        <div className="h-80" />
                    </Flex>
                </Card>
            ) : <StoreBody />}
        </div>
    )
}

export default isUser(ShowStore, ['admin'])
