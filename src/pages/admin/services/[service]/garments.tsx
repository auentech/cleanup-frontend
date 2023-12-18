import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { ServiceResponse } from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import TableSkeleton from '@/components/table-skeleton'
import { PencilIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import {
    Button,
    Callout,
    Card,
    Divider,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Title,
} from '@tremor/react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'

type GarmentsRouterQuery = {
    service: string
} & ParsedUrlQuery

const Garments = () => {
    const axios = useAxios()
    const router = useRouter()

    const { service: serviceID } = router.query as GarmentsRouterQuery
    const { isLoading, isError, data } = useQuery({
        queryKey: ['services', serviceID],
        queryFn: () =>
            axios.get<ServiceResponse>(`/services/${serviceID}`, {
                params: {
                    include: 'garments',
                },
            }),
    })

    return (
        <div className="p-12">
            <Title>Garments</Title>
            <Subtitle>All garments from service</Subtitle>

            <AdminNavigation />

            <Card className="mt-6">
                <Button
                    className="w-full"
                    variant="secondary"
                    disabled={isLoading}
                    loading={isLoading}
                    loadingText="Loading service information..."
                >
                    Add Garments to {data?.data.data.service}
                </Button>

                <Divider />

                {isError && (
                    <Callout title="Something went wrong" color="red">
                        Unable to load garments, please reload
                    </Callout>
                )}

                {isLoading ? (
                    <TableSkeleton numCols={5} numRows={10} />
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>#</TableHeaderCell>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Price</TableHeaderCell>
                                <TableHeaderCell>Created at</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data.data.garments?.map((garment, index) => (
                                <TableRow key={garment.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{garment.name}</TableCell>
                                    <TableCell>{garment.price_max}</TableCell>
                                    <TableCell>
                                        {dayjs(garment.created_at).format(
                                            'DD, MMMM YYYY',
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="xs"
                                            variant="secondary"
                                            icon={PencilIcon}
                                        >
                                            Edit Garment
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    )
}

export default isUser(Garments, ['admin'])
