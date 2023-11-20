import { UsersResponse } from "@/common/types"
import { Button, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TextInput } from "@tremor/react"
import { useEffect, useState } from "react"
import TableSkeleton from "@/components/table-skeleton"
import { ShoppingBagIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import useAxios from "@/common/axios"

const ListCustomers = () => {
    const axios = useAxios()

    const [search, setSearch] = useState<string>('')
    const [customers, setCustomers] = useState<UsersResponse>()

    useEffect(() => {
        const fetchUsers = async () => {
            const UsersResponse = await axios.get<UsersResponse>('/search/customer', {
                params: {
                    query: search
                }
            })

            setCustomers(UsersResponse.data)
        }

        fetchUsers()
    }, [search])

    return (
        <>
            <TextInput
                value={search}
                className="mt-2"
                placeholder="Search customer..."
                onInput={e => setSearch(e.currentTarget.value)} />

            {customers == undefined ? <TableSkeleton /> : (
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
                        {customers.data.map(customer => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.profile?.pincode}</TableCell>
                                <TableCell>{customer.profile?.state.name}</TableCell>
                                <TableCell>{customer.profile?.district.name}</TableCell>
                                <TableCell>
                                    <Link href={'/admin/users/' + customer.id + '/orders'}>
                                        <Button variant="secondary" color="gray" icon={ShoppingBagIcon}>
                                            Show orders
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}

export default ListCustomers
