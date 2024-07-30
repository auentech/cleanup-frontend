import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { UsersResponse } from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import TableSkeleton from '@/components/table-skeleton'
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { Pagination } from '@nextui-org/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
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
    Flex,
} from '@tremor/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

const CustomersList = () => {
    const axios = useAxios()

    const [page, setPage] = useState<number>(0)
    const [customerSearch, setCustomerSearch] = useState<string>('')
    const [bouncedSearch] = useDebounce(customerSearch, 300)

    const { data: customers, isLoading: customersLoading, isFetching: customersFetching } = useQuery({
        queryKey: ['customers', bouncedSearch, page],
        queryFn: ({ signal }) => axios.get<UsersResponse>(
            '/search/customer',
            {
                signal,
                params: {
                    page,
                    store: true,
                    search: customerSearch,
                },
            },
        ),
        select: data => data.data,
        placeholderData: keepPreviousData,
    })

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

                    <div className="mt-2">
                        {customersFetching ? (
                            <TableSkeleton numCols={7} numRows={15} />
                        ) : (
                            <Table>
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

                        {!customersLoading && (
                            customers?.meta.last_page! > 1 && (
                                <Flex justifyContent='center'>
                                    <Pagination
                                        page={page}
                                        onChange={setPage}
                                        total={customers?.meta.last_page!}
                                    />
                                </Flex>
                            )
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default isUser(CustomersList, ['operator'])
