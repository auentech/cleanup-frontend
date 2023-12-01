import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { UsersResponse } from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import TableSkeleton from '@/components/table-skeleton'
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
} from '@heroicons/react/24/outline'
import {
    Card,
    Title,
    Text,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TextInput,
    TableCell,
    Button,
    TableBody,
} from '@tremor/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CustomersList = () => {
    const axios = useAxios()

    const [customers, setCustomers] = useState<UsersResponse>()
    const [customerSearch, setCustomerSearch] = useState<string>('')

    useEffect(() => {
        const fetchUsers = async () => {
            const UsersResponse = await axios.get<UsersResponse>(
                '/search/customer',
                {
                    params: {
                        store: true,
                        search: customerSearch,
                    },
                },
            )

            setCustomers(UsersResponse.data)
        }

        fetchUsers()
    }, [customerSearch])

    return (
        <div className="p-12">
            <Title>Customers?</Title>
            <Text>Oh you want customers? Gotta work for it</Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Card>
                    <Title>Customers</Title>
                    <Text>Customers who have given orders to your store</Text>

                    <TextInput
                        className="mt-2"
                        value={customerSearch}
                        onInput={(e) =>
                            setCustomerSearch(e.currentTarget.value)
                        }
                        icon={MagnifyingGlassIcon}
                        placeholder="Search customers..."
                    />

                    {customers == undefined ? (
                        <TableSkeleton numCols={7} numRows={5} />
                    ) : (
                        <Table className="mt-2">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Email</TableHeaderCell>
                                    <TableHeaderCell>Phone</TableHeaderCell>
                                    <TableHeaderCell>Pincode</TableHeaderCell>
                                    <TableHeaderCell>State</TableHeaderCell>
                                    <TableHeaderCell>District</TableHeaderCell>
                                    <TableHeaderCell>Action</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {customers?.data.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>
                                            {customer.profile?.pincode}
                                        </TableCell>
                                        <TableCell>
                                            {customer.profile?.state.name}
                                        </TableCell>
                                        <TableCell>
                                            {customer.profile?.district.name}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={
                                                    '/operator/customers/' +
                                                    customer.id +
                                                    '/orders'
                                                }
                                            >
                                                <Button
                                                    variant="secondary"
                                                    color="gray"
                                                    icon={ShoppingBagIcon}
                                                >
                                                    Show orders
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default isUser(CustomersList, ['operator'])
