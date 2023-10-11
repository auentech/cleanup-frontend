import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { StoresResponse, UserData } from "@/common/types"
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline"
import { Title, Text, Card, Table, TableHead, TableRow, TableBody, TableCell, TableHeaderCell, Button, Italic, Icon, Flex } from "@tremor/react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Waveform } from '@uiball/loaders'

const AdminIndex = () => {
    const { data } = useSession()
    const user = data?.user as UserData
    const axios = useAxios()

    const [stores, setStores] = useState<StoresResponse | undefined>(undefined)

    useEffect(() => {
        const getStores = async () => {
            const response = await axios.get<StoresResponse>('/stores?include=profile,profile.state,profile.district')
            setStores(response.data)
        }

        getStores()
    }, [])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Admin dashboard for Cleanup {' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <Card className="mt-6" decoration="top">
                <Title>Stores</Title>
                <Text>List of stores in your company</Text>
                <Table className="mt-4">
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
                        {stores != undefined ? stores.data.map(store => (
                            <TableRow key={store.id}>
                                <TableCell>{store.code}</TableCell>
                                <TableCell>{store.name}</TableCell>
                                <TableCell>{store.profile.address}</TableCell>
                                <TableCell>{store.profile.pincode}</TableCell>
                                <TableCell>{store.profile.state.name}</TableCell>
                                <TableCell>{store.profile.district.name}</TableCell>
                                <TableCell>
                                    <Link href={'/stores/' + store.code}>
                                        <Button icon={BuildingStorefrontIcon} size="xs" variant="secondary" color="gray">
                                            Show store
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Flex alignItems="center" justifyContent="center">
                                        <Waveform
                                            size={20}
                                            color="#3b82f6"
                                        />
                                    </Flex>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div >
    )
}

export default isUser(AdminIndex, ['admin'])
