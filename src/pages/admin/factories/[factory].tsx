import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { FactoryResponse } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import { BeakerIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@tanstack/react-query"
import { Title, Text, Flex, Badge, Card, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Button } from "@tremor/react"
import dayjs from "dayjs"
import Link from "next/link"
import { useRouter } from "next/router"

const ShowFactory = () => {
    const axios = useAxios()
    const router = useRouter()

    const { data: factory, isLoading: factoryLoading } = useQuery({
        queryKey: ['factories', router.query.factory],
        queryFn: ({ signal }) => axios.get<FactoryResponse>('factories/' + router.query.factory, {
            signal,
            params: {
                include: [
                    'profile.state',
                    'profile.district',
                    'deliveryChallans.store',
                ]
            },
        }),
        select: data => data.data
    })

    return (
        <div className="p-12">
            <Flex className="gap-4" justifyContent="start">
                <Title>{factory?.data.name} Factory</Title>
                <Badge icon={BeakerIcon}>{factory?.data.code}</Badge>
            </Flex>
            <Text>Located at {factory?.data.profile?.address} in {factory?.data.profile?.district.name} of {factory?.data.profile?.state.name}</Text>

            <AdminNavigation />

            <div className="mt-6">
                <Card>
                    <Title>Delivery challans</Title>
                    <Text>Delivery challans created for this factory</Text>

                    <Table className="mt-2">
                        <TableHead>
                            <TableHeaderCell>DC Code</TableHeaderCell>
                            <TableHeaderCell>Store</TableHeaderCell>
                            <TableHeaderCell>Created on</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableHead>
                        <TableBody>
                            {factory?.data.challans?.map(challan => (
                                <TableRow key={challan.code}>
                                    <TableCell>{challan.code}</TableCell>
                                    <TableCell>
                                        <Link href={"/admin/stores/" + challan.store?.id}>
                                            <Text color="blue">{challan.store?.code}</Text>
                                        </Link>
                                    </TableCell>
                                    <TableCell>{dayjs(challan.created_at).format('DD, MMMM YY')}</TableCell>
                                    <TableCell>
                                        <Link href={"/admin/stores/" + challan.store?.id + "/challans/" + challan.id}>
                                            <Button variant="secondary">
                                                Show challan
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}

export default isUser(ShowFactory, ['admin'])
