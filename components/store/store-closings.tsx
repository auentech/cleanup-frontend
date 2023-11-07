import useAxios from "@/common/axios"
import { ClosingsResponse, Store } from "@/common/types"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import dayjs from "dayjs"
import { useEffect, useState } from "react"

type StoreClosingProps = {
    store: Store
}

const StoreClosings = ({ store }: StoreClosingProps) => {
    const axios = useAxios()

    const [closings, setClosings] = useState<ClosingsResponse>()

    useEffect(() => {
        const fetchClosings = async () => {
            const closingResponse = await axios.get<ClosingsResponse>('/stores/' + store.id + '/closing')
            setClosings(closingResponse.data)
        }

        fetchClosings()
    }, [])

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>Closing on</TableHeaderCell>
                    <TableHeaderCell>Closed by</TableHeaderCell>
                    <TableHeaderCell>UPI</TableHeaderCell>
                    <TableHeaderCell>Card</TableHeaderCell>
                    <TableHeaderCell>Cash</TableHeaderCell>
                    <TableHeaderCell>Expense</TableHeaderCell>
                    <TableHeaderCell>Remarks</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {closings?.data.map((closing, i) => (
                    <TableRow key={i}>
                        <TableCell>{dayjs(closing.created_at).format('DD, MMMM YY')}</TableCell>
                        <TableCell>{closing.performer.name}</TableCell>
                        <TableCell>₹ {closing.upi}</TableCell>
                        <TableCell>₹ {closing.card}</TableCell>
                        <TableCell>₹ {closing.cash}</TableCell>
                        <TableCell>₹ {closing.expense}</TableCell>
                        <TableCell>{closing.remarks}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default StoreClosings
