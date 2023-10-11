import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from '@tremor/react'
import { Text } from '@tremor/react'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import isUser from '@/common/middlewares/isUser'
import { useSession } from 'next-auth/react'
import useAxios from '@/common/axios'
import { useEffect } from 'react'

const Home = () => {
    const session = useSession()
    const axios = useAxios()

    useEffect(() => {
        (async () => {
            const res = await axios.get('/stores?include=profile,profile.state,profile.district')
            console.log(res.data)
        })()
    }, [session.status])

    return (
        <main className="p-12">
            <Title>Admin Dashboard</Title>
            <Text>Welcome to your dashboard, <strong>{session.data?.user?.name}</strong></Text>

            <Card className="mt-6">
                <Title>Stores</Title>
                <Text>All available stores in your business</Text>

                <Table className="mt-6">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Store Code</TableHeaderCell>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Address</TableHeaderCell>
                            <TableHeaderCell>Pincode</TableHeaderCell>
                            <TableHeaderCell>State</TableHeaderCell>
                            <TableHeaderCell>District</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>STO-AMB-1</TableCell>
                            <TableCell>Iswosak</TableCell>
                            <TableCell>Somewhere in this world with sun shining on it</TableCell>
                            <TableCell>600053</TableCell>
                            <TableCell>Tamil Nadu</TableCell>
                            <TableCell>Chennai</TableCell>
                            <TableCell>
                                <Button icon={BuildingStorefrontIcon} size="xs" variant="secondary" color="gray">
                                    Show store
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>STO-AMB-2</TableCell>
                            <TableCell>Okinava</TableCell>
                            <TableCell>Beauty shining on the screen through LED lights</TableCell>
                            <TableCell>600043</TableCell>
                            <TableCell>Tamil Nadu</TableCell>
                            <TableCell>Royapettah</TableCell>
                            <TableCell>
                                <Button icon={BuildingStorefrontIcon} size="xs" variant="secondary" color="gray">
                                    Show store
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </main>
    )
}

export default isUser(Home, ['admin'])
