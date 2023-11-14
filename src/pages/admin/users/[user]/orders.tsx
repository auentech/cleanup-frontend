import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import FormatNumber from '@/common/number-formatter'
import StatusBadger from '@/common/status-badger'
import { LoginResponse, UserData } from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { Title, Text, Italic, Card, Subtitle, Table, TableRow, TableHead, TableBody, TableCell, TableHeaderCell, Button } from '@tremor/react'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type UserOrdersQuery = {
    user: string
}

const UserOrders = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const [customer, setCustomer] = useState<UserData>()

    const query = router.query as UserOrdersQuery
    const user = data?.user as UserData

    useEffect(() => {
        const fetchUser = async () => {
            const userResponse = await axios.get<LoginResponse>('/user/' + query.user, {
                params: {
                    include: ['orders', 'orders.store']
                }
            })

            // @ts-ignore
            setCustomer(userResponse.data.data)
            console.log(userResponse.data.data)
        }

        fetchUser()
    }, [])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Admin dashboard for Cleanup{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <AdminNavigation />

            <Card decoration="top" decorationColor="blue" className="mt-6">
                <Title>{customer?.name}'s orders</Title>
                <Subtitle>Every order made by {customer?.name} across your business</Subtitle>

                <Table className='mt-4'>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Code</TableHeaderCell>
                            <TableHeaderCell>Cost</TableHeaderCell>
                            <TableHeaderCell>Garments</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Created on</TableHeaderCell>
                            <TableHeaderCell>Package</TableHeaderCell>
                            <TableHeaderCell>Store</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customer?.orders != undefined ? customer?.orders?.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>{order.code}</TableCell>
                                <TableCell>₹ {FormatNumber(order.cost)}</TableCell>
                                <TableCell>{order.count}</TableCell>
                                <TableCell>{StatusBadger(order.status)}</TableCell>
                                <TableCell>{dayjs(order.created_at).format('DD, MMMM YY')}</TableCell>
                                <TableCell className='capitalize'>{order.package}</TableCell>
                                <TableCell>{order.store?.name}</TableCell>
                                <TableCell>
                                    <Link href={'/admin/stores/' + order.store?.id + '/orders/' + order.code}>
                                        <Button icon={ShoppingCartIcon} variant='secondary' color='gray'>
                                            Show order
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4}>No orders by customer</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

export default isUser(UserOrders, ['admin'])
