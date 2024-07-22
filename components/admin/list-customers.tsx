import { UsersResponse } from '@/common/types'
import {
    Button,
    Flex,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TextInput,
} from '@tremor/react'
import { useState } from 'react'
import TableSkeleton from '@/components/table-skeleton'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import useAxios from '@/common/axios'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Pagination } from '@nextui-org/react'

const ListCustomers = () => {
    const axios = useAxios()

    const [page, setPage] = useState<number>(1)
    const [search, setSearch] = useState<string>('')
    const [debouncedSearch] = useDebounce(search, 300)

    const { data: customers, isFetching: customersLoading, isLoading: firstCustomersLoad } = useQuery({
        queryKey: ['users', debouncedSearch, page],
        queryFn: ({ signal }) => axios.get<UsersResponse>(
            '/search/customer',
            {
                signal,
                params: {
                    page,
                    search: debouncedSearch,
                },
            },
        ),
        placeholderData: keepPreviousData
    })

    return (
        <>
            <TextInput
                value={search}
                className="mt-2"
                placeholder="Search customer..."
                onInput={(e) => setSearch(e.currentTarget.value)}
            />

            {customers == undefined || customersLoading ? (
                <TableSkeleton numCols={7} numRows={15} />
            ) : (
                <>
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
                            {customers.data.data.map((customer) => (
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
                                                '/admin/users/' +
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
                </>
            )}

            {!firstCustomersLoad && (
                <Flex alignItems='center' justifyContent='center'>
                    <Pagination
                        page={page}
                        onChange={setPage}
                        total={customers?.data.meta.last_page!}
                    />
                </Flex>
            )}
        </>
    )
}

export default ListCustomers
