import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { ReturnChallan, ReturnChallansResponse, UserData } from "@/common/types"
import { CameraIcon, ShoppingBagIcon } from "@heroicons/react/24/outline"
import { Subtitle, Title, Italic, Card, TabList, TabGroup, Tab, TabPanels, TabPanel, Flex, Table, TableHead, TableHeaderCell, TableRow, TableBody, TableCell, Button } from "@tremor/react"
import { Waveform } from "@uiball/loaders"
import dayjs from "dayjs"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useState } from "react"

const LazyCreateReturn = dynamic(() => import('@/components/create-return'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
        </Flex>
    )
})

const PackerHome = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [index, setIndex] = useState<number>(0)
    const [returnChallans, setReturnChallans] = useState<ReturnChallan[]>([])

    useEffect(() => {
        const fetchReturnChallans = async () => {
            const challans = await axios.get<ReturnChallansResponse>('/return-challans', {
                params: {
                    include: [
                        'store',
                        'store.profile.state',
                        'store.profile.district',
                    ]
                }
            })

            setReturnChallans(challans.data.data)
        }

        fetchReturnChallans()
    }, [])

    return (
        <div className="p-12">
            <Title>Operator dashboard</Title>
            <Subtitle>
                Operator dashboard for {user?.name}{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Subtitle>

            <div className="mt-4">
                <Card>
                    <Title>Return challans</Title>
                    <Subtitle>Send orders back to the store</Subtitle>

                    <TabGroup className="mt-2" onIndexChange={setIndex}>
                        <TabList>
                            <Tab>List challans</Tab>
                            <Tab>Create challan</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>
                                                RC Code
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Store Code
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Store Name
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Created at
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Order codes
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                QR Codes
                                            </TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {returnChallans.length > 0 && returnChallans.map(challan => (
                                            <TableRow key={challan.code}>
                                                <TableCell>{challan.code}</TableCell>
                                                <TableCell>{challan.store?.code}</TableCell>
                                                <TableCell>{challan.store?.name}</TableCell>
                                                <TableCell>
                                                    {dayjs(challan.created_at).format('DD, MMMM YY')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="light" icon={ShoppingBagIcon}>Show order codes</Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={process.env.NEXT_PUBLIC_BACKEND_URL + '/api/return-challans/' + challan.code + '/qr?token=' + user?.token} target="_blank">
                                                        <Button variant="secondary" icon={CameraIcon}>Show QR codes</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabPanel>

                            <TabPanel>
                                {index == 1 && <LazyCreateReturn />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
    )
}

export default isUser(PackerHome, ['packer'])
