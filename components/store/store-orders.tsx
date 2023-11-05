import FormatNumber from "@/common/number-formatter"
import { OrdersResponse, StatusEnum, StoreResponse } from "@/common/types"
import { ArrowPathIcon, BuildingStorefrontIcon, ExclamationTriangleIcon, ReceiptPercentIcon, UserIcon } from "@heroicons/react/24/outline"
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Button, Badge } from "@tremor/react"
import dayjs from "dayjs"
import Link from "next/link"

type StoreOrdersType = {
    orders: OrdersResponse | undefined
    store: StoreResponse | undefined
    role?: 'admin' | 'operator' | 'manager'
}

const statusBadger = (status: StatusEnum) => {
    switch (status) {
        case 'received':
            return <Badge color="red" size="sm" icon={ExclamationTriangleIcon}>Unprocessed</Badge>
        case 'in_process':
            return <Badge color="blue" size="sm" icon={ArrowPathIcon}>In Factory</Badge>
        case 'in_store':
        case 'processed':
            return <Badge color="yellow" size="sm" icon={BuildingStorefrontIcon}>In store</Badge>
        case 'delivered':
            return <Badge color="green" size="sm" icon={UserIcon}>Delivered</Badge>
    }
}

const StoreOrders = ({ orders, store, role }: StoreOrdersType) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Order date</TableHeaderCell>
                    <TableHeaderCell>Garments</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {orders?.data.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>{order.code}</TableCell>
                        <TableCell>{order.customer?.name}</TableCell>
                        <TableCell>{dayjs(order.created_at).format('DD, MMMM YY')}</TableCell>
                        <TableCell>{order.count}</TableCell>
                        <TableCell>{statusBadger(order.status)}</TableCell>
                        <TableCell>₹ {FormatNumber(order.cost)}</TableCell>
                        <TableCell>
                            <Link href={'/' + role + '/stores/' + store?.data.id + '/orders/' + order.code}>
                                <Button variant="secondary" color="gray" icon={ReceiptPercentIcon}>Show order</Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default StoreOrders
