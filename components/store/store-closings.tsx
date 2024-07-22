import useAxios from '@/common/axios'
import { ClosingsResponse, Store, UserData } from '@/common/types'
import { useQuery } from '@tanstack/react-query'
import {
    Button,
    Callout,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from '@tremor/react'
import dayjs from 'dayjs'
import TableSkeleton from '@/components/table-skeleton'
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import FormatNumber from '@/common/number-formatter'

type StoreClosingProps = {
    store: Store
}

const StoreClosings = ({ store }: StoreClosingProps) => {
    const axios = useAxios()

    const { data } = useSession()
    const user = data?.user as UserData

    const {
        data: closings,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['store', store.id, 'closing'],
        queryFn: ({ signal }) =>
            axios.get<ClosingsResponse>('/stores/' + store.id + '/closing', { signal }),
        select: (data) => data.data,
    })

    return (
        <>
            {isLoading ? (
                <TableSkeleton numRows={15} numCols={6} />
            ) : (
                <>
                    {isError ? (
                        <Callout title="Oops, something wrong" color="red" />
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Closing on</TableHeaderCell>
                                    <TableHeaderCell>Closed by</TableHeaderCell>
                                    <TableHeaderCell>Earning</TableHeaderCell>
                                    <TableHeaderCell>Expense</TableHeaderCell>
                                    <TableHeaderCell>Remarks</TableHeaderCell>
                                    <TableHeaderCell>Export</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {closings?.data.map((closing, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {dayjs(closing.created_at).format('DD, MMMM YY')}
                                        </TableCell>
                                        <TableCell>{closing.performer.name}</TableCell>
                                        <TableCell>
                                            ₹ {FormatNumber(closing.upi + closing.card + closing.cash)}
                                        </TableCell>
                                        <TableCell>₹ {FormatNumber(closing.expense)}</TableCell>
                                        <TableCell>{closing.remarks}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}api/stores/${store.id}/closing/${closing.id}?token=${user.token}&excel=true`}
                                                target="_blank"
                                            >
                                                <Button
                                                    variant="secondary"
                                                    color="blue"
                                                    icon={ArrowDownTrayIcon}
                                                >
                                                    Download Excel
                                                </Button>
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </>
            )}
        </>
    )
}

export default StoreClosings
