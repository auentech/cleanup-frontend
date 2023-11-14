import FormatNumber from "@/common/number-formatter"
import StatusBadger from "@/common/status-badger"
import { OrdersResponse, StoreResponse } from "@/common/types"
import { ReceiptPercentIcon } from "@heroicons/react/24/outline"
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Button } from "@tremor/react"
import dayjs from "dayjs"
import Link from "next/link"

type StoreOrdersType = {
    orders: OrdersResponse | undefined
    store: StoreResponse | undefined
    role?: 'admin' | 'operator' | 'manager'
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
                    <TableHeaderCell>Due on</TableHeaderCell>
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
                        <TableCell>{StatusBadger(order.status)}</TableCell>
                        <TableCell>₹ {FormatNumber(order.cost)}</TableCell>
                        <TableCell>{order.due_date ? dayjs(order.due_date).format('DD, MMMM YY') : 'General'}</TableCell>
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
