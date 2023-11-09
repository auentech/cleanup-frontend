import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { OrdersResponse, UserData } from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import TableSkeleton from '@/components/table-skeleton'
import { ReceiptPercentIcon } from '@heroicons/react/24/outline'
import {
    Button,
    Card,
    Flex,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from '@tremor/react'
import { Waveform } from '@uiball/loaders'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const LazyCreateRewash = dynamic(
    () => import('@/components/store/order/create-rewash'),
    {
        loading: () => (
            <Flex alignItems="center" justifyContent="center">
                <Waveform size={20} color="#3b82f6" />
            </Flex>
        ),
    },
)

type RewashOrderQuery = {
    order?: string
}

const ListRewash = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData
    const query = router.query as RewashOrderQuery

    const [index, setIndex] = useState<number>(0)
    const [orders, setOrders] = useState<OrdersResponse>()

    useEffect(() => {
        const initData = async () => {
            const storeID = user.store_id

            if (query.order) {
                setIndex(1)
                return
            }

            const ordersResponse = await axios.get<OrdersResponse>(
                '/stores/' + storeID + '/orders',
                {
                    params: {
                        include: ['customer', 'rewash'],
                        filter: {
                            rewash: 'yes',
                        },
                    },
                },
            )

            setOrders(ordersResponse.data)
        }

        initData()
    }, [])

    return (
        <div className="p-12">
            <Title>Rewash</Title>
            <Text>Oh oh, customer not happy? Let's fix that</Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Card>
                    <Title>Rewashes</Title>
                    <Text>List of all rewashes</Text>
                    <TabGroup
                        className="mt-4"
                        index={index}
                        onIndexChange={setIndex}
                    >
                        <TabList>
                            <Tab>List rewashes</Tab>
                            <Tab>Create rewash</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <div className="mt-4">
                                    {orders == undefined ? (
                                        <TableSkeleton
                                            numCols={7}
                                            numRows={5}
                                        />
                                    ) : (
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableHeaderCell>
                                                        Code
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Customer
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Rewash date
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Garments
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Status
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Original order
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Action
                                                    </TableHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {orders?.data.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell>
                                                            {order.code}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                order.customer
                                                                    ?.name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {dayjs(
                                                                order.created_at,
                                                            ).format(
                                                                'DD, MMMM YY',
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {order.count}
                                                        </TableCell>
                                                        <TableCell>
                                                            {order.status}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Link
                                                                href={
                                                                    '/operator/stores/' +
                                                                    user.store_id +
                                                                    '/orders/' +
                                                                    order.rewash
                                                                        ?.code
                                                                }
                                                            >
                                                                <Text color="blue">
                                                                    {
                                                                        order
                                                                            .rewash
                                                                            ?.code
                                                                    }
                                                                </Text>
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Link
                                                                href={
                                                                    '/operator/stores/' +
                                                                    user.store_id +
                                                                    '/orders/' +
                                                                    order.code
                                                                }
                                                            >
                                                                <Button
                                                                    variant="secondary"
                                                                    color="gray"
                                                                    icon={
                                                                        ReceiptPercentIcon
                                                                    }
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
                            </TabPanel>
                            <TabPanel>
                                {index == 1 && (
                                    <LazyCreateRewash user={user as UserData} />
                                )}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
    )
}

export default isUser(ListRewash, ['operator'])
