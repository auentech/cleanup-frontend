import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { ServicesResponse } from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import TableSkeleton from '@/components/table-skeleton'
import { useQuery } from '@tanstack/react-query'
import {
    Button,
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
import Link from 'next/link'

const Services = () => {
    const axios = useAxios()
    const { isLoading, isError, data } = useQuery({
        queryKey: ['services'],
        queryFn: () =>
            axios.get<ServicesResponse>('/services', {
                params: {
                    include: 'garmentsCount',
                },
            }),
    })

    return (
        <>
            <div className="p-12">
                <Title>Services</Title>
                <Subtitle>All services available in your business</Subtitle>

                <AdminNavigation />

                <Card className="mt-6">
                    <div>
                        {isLoading ? (
                            <TableSkeleton numRows={10} numCols={4} />
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>ID</TableHeaderCell>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>
                                            Garments
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Created on
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Action
                                        </TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.data.data.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell>{service.id}</TableCell>
                                            <TableCell>
                                                {service.service}
                                            </TableCell>
                                            <TableCell>
                                                {service.garments_count}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(
                                                    service.created_at,
                                                ).format('DD, MMMM YY')}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/services/${service.id}/garments`}
                                                >
                                                    <Button
                                                        size="xs"
                                                        variant="secondary"
                                                    >
                                                        View Garments
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <Divider />

                    <Button className="w-full" variant="secondary">
                        Add service
                    </Button>
                </Card>
            </div>
        </>
    )
}

export default isUser(Services, ['admin'])
