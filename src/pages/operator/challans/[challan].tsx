import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import {
    DeliveryChallanResponse,
    UserData,
} from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import {
    ArchiveBoxIcon,
    BuildingStorefrontIcon,
    CodeBracketIcon,
    CurrencyRupeeIcon,
    PrinterIcon,
    ReceiptPercentIcon,
} from '@heroicons/react/24/outline'
import {
    Title,
    Text,
    Grid,
    Card,
    Flex,
    Icon,
    Metric,
    Table,
    TableRow,
    Button,
    Divider,
    TableHead,
    TableHeaderCell,
    TableBody,
    TableCell,
} from '@tremor/react'
import { useRouter } from 'next/router'
import sumBy from 'lodash/sumBy'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Skeleton } from '@nextui-org/react'
import TableSkeleton from '@/components/table-skeleton'

const ShowChallan = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData
    const challanID = router.query.challan

    const { data: challan, isLoading: challanLoading } = useQuery({
        queryKey: ['delivery challans', user.store_id, challanID],
        queryFn: ({ signal }) => axios.get<DeliveryChallanResponse>(
            '/stores/' + user.store_id + '/challans/' + challanID,
            {
                signal,
                params: {
                    include: ['store', 'orders'],
                },
            },
        ),
        select: data => data.data,
    })

    return (
        <div className="p-12">
            <Title>Delivery challans</Title>
            <Text>
                Creating delivery challans help you to track with factories
            </Text>

            <div className="mt-4">
                <Grid numItemsSm={2} numItemsLg={4} className="mt-6 gap-6">
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={CodeBracketIcon}
                                variant="light"
                                color="blue"
                                size="xl"
                            />
                            <div className="truncate">
                                <Title>Code</Title>
                                {challanLoading ? <Skeleton className='h-9 rounded-lg w-full' /> : (
                                    <Metric>{challan?.data.code}</Metric>
                                )}
                            </div>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor="orange">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={CurrencyRupeeIcon}
                                variant="light"
                                color="orange"
                                size="xl"
                            />
                            <div className="truncate">
                                <Title>Cost</Title>
                                {challanLoading ? <Skeleton className='h-9 rounded-lg w-full' /> : (
                                    <Metric>
                                        ₹ {sumBy(challan?.data.orders, 'cost')}
                                    </Metric>
                                )}
                            </div>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor="fuchsia">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={BuildingStorefrontIcon}
                                variant="light"
                                color="fuchsia"
                                size="xl"
                            />
                            <div className="truncate">
                                <Title>Store</Title>
                                {challanLoading ? <Skeleton className='h-9 rounded-lg w-full' /> : (
                                    <Metric>{challan?.data.store?.name}</Metric>
                                )}
                            </div>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor="teal">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon
                                icon={ArchiveBoxIcon}
                                variant="light"
                                color="teal"
                                size="xl"
                            />
                            <div className="truncate">
                                <Title>Clothes</Title>
                                {challanLoading ? <Skeleton className='h-9 rounded-lg w-full' /> : (
                                    <Metric>
                                        {sumBy(challan?.data.orders, 'count')}
                                    </Metric>
                                )}
                            </div>
                        </Flex>
                    </Card>
                </Grid>
            </div>

            <OperatorNavigation />

            <div className="mt-6">
                <Card>
                    <Title>Challan items</Title>
                    <Text>All orders added to this delivery challan</Text>

                    <div className="mt-4">
                        {challanLoading ? <TableSkeleton numRows={15} numCols={5} /> : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Order code</TableHeaderCell>
                                        <TableHeaderCell>
                                            No. of garments
                                        </TableHeaderCell>
                                        <TableHeaderCell>Due date</TableHeaderCell>
                                        <TableHeaderCell>Package</TableHeaderCell>
                                        <TableHeaderCell>Action</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {challan?.data.orders?.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.code}</TableCell>
                                            <TableCell>{order.count}</TableCell>
                                            <TableCell>
                                                {order.due_date
                                                    ? dayjs(order.due_date).format(
                                                        'DD, MMMM YY',
                                                    )
                                                    : 'General'}
                                            </TableCell>
                                            <TableCell>{order.package}</TableCell>
                                            <TableCell>
                                                <Link
                                                    href={
                                                        '/operator/stores/' +
                                                        challan.data.store?.id +
                                                        '/orders/' +
                                                        order.code
                                                    }
                                                >
                                                    <Button
                                                        icon={ArchiveBoxIcon}
                                                        variant="secondary"
                                                    >
                                                        Show order
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



                    <Flex justifyContent="end" className="gap-6">
                        <Dropdown showArrow>
                            <DropdownTrigger>
                                <Button variant='secondary' color='blue'>Export</Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem as="a" target="_blank"
                                    href={
                                        process.env.NEXT_PUBLIC_BACKEND_URL +
                                        'api/stores/' +
                                        user.store_id +
                                        '/challans/' +
                                        challanID +
                                        '/excel?token=' +
                                        user.token
                                    }
                                    startContent={<ReceiptPercentIcon height={20} width={20} />}
                                    key="excel">Export as excel</DropdownItem>

                                <DropdownItem as="a" target="_blank"
                                    href={
                                        process.env.NEXT_PUBLIC_BACKEND_URL +
                                        'api/stores/' +
                                        user.store_id +
                                        '/challans/' +
                                        challanID +
                                        '/pdf?token=' +
                                        user.token
                                    }
                                    startContent={<PrinterIcon height={20} width={20} />}
                                    key="pdf">Export as PDF</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Flex>
                </Card>
            </div>
        </div>
    )
}

export default isUser(ShowChallan, ['operator'])
