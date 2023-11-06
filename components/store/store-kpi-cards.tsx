import { StoreResponse } from "@/common/types"
import { ReceiptPercentIcon, ShoppingCartIcon, ArchiveBoxIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline"
import { Card, Flex, Icon, Title, Metric, AreaChart } from "@tremor/react"
import lodashSumBy from "lodash/sumBy"
import lodashSortBy from "lodash/sortBy"
import lodashMap from "lodash/map"
import { useEffect, useState } from "react"
import FormatNumber from "@/common/number-formatter"

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

type StoreKPICardsType = {
    store: StoreResponse | undefined
}

const StoreKPICards = ({ store }: StoreKPICardsType) => {
    const [loading, setLoading] = useState<boolean>(true)

    const [salesMetrics, setSalesMetrics] = useState<SalesMetricType[]>()
    const [ordersMetrics, setOrdersMetrics] = useState<OrdersMetricType[]>()
    const [balanceMetrics, setBalanceMetrics] = useState<SalesMetricType[]>()
    const [clothesMetrics, setClothesMetrics] = useState<ClothsMetricType[]>()

    useEffect(() => {
        const calculateSalesMetrics = () => {
            const theMetricOrders = store?.metrics?.ordersSevenDays
            const data = lodashMap(theMetricOrders, (theOrders, date) => {
                return {
                    date,
                    Cost: lodashSumBy(theOrders, 'cost')
                }
            })

            setSalesMetrics(lodashSortBy(data, 'date'))
        }

        const calculateOrdersMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data = lodashMap(theOrdersMetrics, (theOrders, date) => {
                return {
                    date,
                    Orders: theOrders.length
                }
            })

            setOrdersMetrics(lodashSortBy(data, 'date'))
        }

        const calculateClothesMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data = lodashMap(theOrdersMetrics, (theOrders, date) => {
                return {
                    date,
                    Count: lodashSumBy(theOrders, 'count')
                }
            })

            setClothesMetrics(lodashSortBy(data, 'date'))
        }

        const calculateBalanceMetrics = () => {
            const theOrdersMetrics = store?.metrics?.ordersSevenDays
            const data: SalesMetricType[] = lodashMap(theOrdersMetrics, (theOrders, date) => {
                const totalCost = lodashSumBy(theOrders, 'cost')
                const totalPaid = lodashSumBy(theOrders, 'paid')

                return {
                    date,
                    Cost: totalCost - totalPaid
                }
            })

            setBalanceMetrics(lodashSortBy(data, 'date'))
        }

        calculateSalesMetrics()
        calculateOrdersMetrics()
        calculateClothesMetrics()
        calculateBalanceMetrics()

        setLoading(false)
    }, [store])

    return (
        <>
            {!loading && (
                <>
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ReceiptPercentIcon} variant="light" color="blue" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Sales</Title>
                                <Metric>₹ {FormatNumber(lodashSumBy(salesMetrics, 'Cost'))}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
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
                                <Metric>{lodashSumBy(ordersMetrics, 'Orders')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
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
                                <Metric>{lodashSumBy(clothesMetrics, 'Count')}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
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
                    <Card decoration="top" decorationColor="lime">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={CurrencyRupeeIcon} variant="light" color="lime" size="xl"></Icon>
                            <div className="truncate">
                                <Title>Balance</Title>
                                <Metric>₹ {FormatNumber(lodashSumBy(balanceMetrics, 'Cost'))}</Metric>
                            </div>
                        </Flex>
                        <AreaChart
                            className="mt-6"
                            style={{ height: 150 }}
                            data={balanceMetrics as SalesMetricType[]}
                            index="date"
                            categories={['Cost']}
                            colors={["lime"]}
                            showXAxis={true}
                            showGridLines={false}
                            startEndOnly={true}
                            showYAxis={false}
                            showLegend={false}
                        />
                    </Card>
                </>
            )}
        </>
    )
}

export default StoreKPICards
