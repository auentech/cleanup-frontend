import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { StoreResponse } from "@/common/types"
import { ArchiveBoxIcon, BeakerIcon, BuildingStorefrontIcon, HomeIcon, NewspaperIcon, PencilIcon, ReceiptPercentIcon, ShoppingCartIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline"
import { AreaChart, Badge, Button, Card, Flex, Grid, Icon, Metric, Text, Title } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import _ from 'lodash'
import Navigation from "@/common/navigation"

type SalesMetricType = {
    date: string,
    Cost: number
}

type OrdersMetricType = {
    date: string,
    Orders: number
}

type ClothsMetricType = {
    date: string
    Count: number
}

const ShowStore = () => {
    const axios = useAxios()
    const router = useRouter()

    const [store, setStore] = useState<StoreResponse>()
    const [loading, setLoading] = useState<boolean>(true)

    const [salesMetrics, setSalesMetrics] = useState<SalesMetricType[]>()
    const [ordersMetrics, setOrdersMetrics] = useState<OrdersMetricType[]>()
    const [clothesMetrics, setClothesMetrics] = useState<ClothsMetricType[]>()

    useEffect(() => {
        (async () => {
            const response = await axios.get<StoreResponse>('/stores/' + router.query.store, {
                params: {
                    include: ['profile.state', 'profile.district']
                }
            })

            setLoading(false)
            setStore(response.data)
        })()
    }, [])

    useEffect(() => {
        const calculateSalesMetrics = () => {
            const theMetricOrders = store?.metrics?.ordersSevenDays
            const data = _.map(theMetricOrders, (theOrders, date) => {
                return {
                    date,
                    Cost: _.sumBy(theOrders, 'cost')
                }
            })

            setSalesMetrics(data)
        }

        const calculateOrdersMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data = _.map(theOrdersMetrics, (theOrders, date) => {
                return {
                    date,
                    Orders: theOrders.length
                }
            })

            setOrdersMetrics(data)
        }

        const calculateClothesMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data = _.map(theOrdersMetrics, (theOrders, date) => {
                return {
                    date,
                    Count: _.sumBy(theOrders, 'count')
                }
            })

            setClothesMetrics(data)
        }

        calculateSalesMetrics()
        calculateOrdersMetrics()
        calculateClothesMetrics()
    }, [store])

    const StoreBody = () => (
        <div>
            <Flex justifyContent="between" className="space-x-6">
                <div>
                    <Flex>
                        <Title>{store?.data.name} store</Title>
                        <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">{store?.data.code}</Badge>
                    </Flex>
                </div>
                <div className="space-x-4">
                    <Button color="red" variant="secondary" icon={TrashIcon}>Delete</Button>
                    <Button variant="secondary" icon={PencilIcon}>Edit</Button>
                </div>
            </Flex>
            <Text>Store located at: {store?.data.profile.address}</Text>

            <Navigation className="mt-6" data={[
                { icon: HomeIcon, text: 'Home', path: '/admin' },
                {
                    icon: BuildingStorefrontIcon,
                    text: 'Stores',
                    path: '/admin/stores',
                    subPath: ['/admin/stores/[store]']
                },
                { icon: BeakerIcon, text: 'Factories', path: '/factories' },
                { icon: UserIcon, text: 'Workers', path: '/workers' },
                { icon: NewspaperIcon, text: 'Reports', path: '/admin/reports' },
            ]} />

            <div className="mt-6">
                <Grid numItemsLg={3} className="gap-6">
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ReceiptPercentIcon} variant="light" color="blue" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Sales</Title>
                                <Metric>₹ {_.sumBy(salesMetrics, 'Cost')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6 h-28"
                            data={salesMetrics as SalesMetricType[]}
                            index="date"
                            categories={['Cost']}
                            colors={["blue"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                    <Card decoration="top" decorationColor="cyan">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ShoppingCartIcon} variant="light" color="cyan" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Orders</Title>
                                <Metric>{_.sumBy(ordersMetrics, 'Orders')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6 h-28"
                            data={ordersMetrics as OrdersMetricType[]}
                            index="date"
                            categories={['Orders']}
                            colors={["cyan"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                    <Card decoration="top" decorationColor="pink">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ArchiveBoxIcon} variant="light" color="pink" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Clothes</Title>
                                <Metric>{_.sumBy(clothesMetrics, 'Count')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6 h-28"
                            data={clothesMetrics as ClothsMetricType[]}
                            index="date"
                            categories={['Count']}
                            colors={["pink"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                </Grid>
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
