import { Order } from '@/common/types'
import {
    CurrencyRupeeIcon,
    ArchiveBoxIcon,
    ReceiptRefundIcon,
    ChartPieIcon,
} from '@heroicons/react/24/outline'
import { Card, Flex, Icon, Title, Metric } from '@tremor/react'
import FormatNumber from '@/common/number-formatter'

type OrderKPICardsType = {
    order: Order
}

const OrderKPICards = ({ order }: OrderKPICardsType) => {
    return (
        <>
            <Card decoration="top" decorationColor="blue">
                <Flex justifyContent="start" className="space-x-6">
                    <Icon icon={CurrencyRupeeIcon} variant="light" color="blue" size="xl" />
                    <div className="truncate">
                        <Title>Cost</Title>
                        <Metric>₹ {FormatNumber(order.cost)}</Metric>
                    </div>
                </Flex>
            </Card>
            <Card decoration="top" decorationColor="orange">
                <Flex justifyContent="start" className="space-x-6">
                    <Icon icon={ArchiveBoxIcon} variant="light" color="orange" size="xl" />
                    <div className="truncate">
                        <Title>Clothes</Title>
                        <Metric>{order.count}</Metric>
                    </div>
                </Flex>
            </Card>
            <Card decoration="top" decorationColor="fuchsia">
                <Flex justifyContent="start" className="space-x-6">
                    <Icon icon={ReceiptRefundIcon} variant="light" color="fuchsia" size="xl" />
                    <div className="truncate">
                        <Title>Balance</Title>
                        <Metric>₹ {FormatNumber(order.cost - order.paid)}</Metric>
                    </div>
                </Flex>
            </Card>
            <Card decoration="top" decorationColor="teal">
                <Flex justifyContent="start" className="space-x-6">
                    <Icon icon={ChartPieIcon} variant="light" color="teal" size="xl" />
                    <div className="truncate">
                        <Title>Discount</Title>
                        <Metric>₹ {FormatNumber(order.discount)}</Metric>
                    </div>
                </Flex>
            </Card>
        </>
    )
}

export default OrderKPICards
