import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { DeliveryChallanResponse, LoginResponse, UserData } from "@/common/types"
import OperatorNavigation from "@/components/operator/operator-navigation"
import { ArchiveBoxIcon, BuildingStorefrontIcon, CodeBracketIcon, CurrencyRupeeIcon, PrinterIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline"
import { Title, Text, Grid, Card, Flex, Icon, Metric, Table, TableRow, Button, Divider, TableHead, TableHeaderCell, TableBody, TableCell } from "@tremor/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import sumBy from "lodash/sumBy"
import Link from "next/link"
import { useSession } from "next-auth/react"
import dayjs from "dayjs"

const ShowChallan = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const auth = data?.user as UserData
    const challanID = router.query.challan

    const [user, setUser] = useState<LoginResponse>()
    const [challan, setChallan] = useState<DeliveryChallanResponse>()

    useEffect(() => {
        const fetchData = async () => {
            const userResponse = await axios.get<LoginResponse>('user')

            const storeID = userResponse.data.meta.store_id
            setUser(userResponse.data)

            const challanResponse = await axios.get<DeliveryChallanResponse>('/stores/' + storeID + '/challans/' + challanID, {
                params: {
                    include: ['store', 'orders']
                }
            })

            setChallan(challanResponse.data)
        }

        fetchData()
    }, [])

    return (
        <div className="p-12">
            <Title>Delivery challans</Title>
            <Text>Creating delivery challans help you to track with factories</Text>

            <div className="mt-4">
                <Grid numItemsSm={2} numItemsLg={4} className="gap-6 mt-6">
                    <Card decoration="top" decorationColor="blue">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={CodeBracketIcon} variant="light" color="blue" size="xl" />
                            <div className="truncate">
                                <Title>Code</Title>
                                <Metric>{challan?.data.code}</Metric>
                            </div>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor="orange">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={CurrencyRupeeIcon} variant="light" color="orange" size="xl" />
                            <div className="truncate">
                                <Title>Cost</Title>
                                <Metric>₹ {sumBy(challan?.data.orders, 'cost')}</Metric>
                            </div>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor="fuchsia">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={BuildingStorefrontIcon} variant="light" color="fuchsia" size="xl" />
                            <div className="truncate">
                                <Title>Store</Title>
                                <Metric>{challan?.data.store?.name}</Metric>
                            </div>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor="teal">
                        <Flex justifyContent="start" className="space-x-6">
                            <Icon icon={ArchiveBoxIcon} variant="light" color="teal" size="xl" />
                            <div className="truncate">
                                <Title>Clothes</Title>
                                <Metric>{sumBy(challan?.data.orders, 'count')}</Metric>
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

                    <Table className="mt-4">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Order code</TableHeaderCell>
                                <TableHeaderCell>No. of garments</TableHeaderCell>
                                <TableHeaderCell>Due date</TableHeaderCell>
                                <TableHeaderCell>Package</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {challan?.data.orders?.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.code}</TableCell>
                                    <TableCell>{order.count}</TableCell>
                                    <TableCell>{order.due_date ? dayjs(order.due_date).format('DD, MMMM YY') : 'General'}</TableCell>
                                    <TableCell>{order.package}</TableCell>
                                    <TableCell>
                                        <Link href={'/operator/stores/' + challan.data.store?.id + '/orders/' + order.code}>
                                            <Button icon={ArchiveBoxIcon} variant="secondary">
                                                Show order
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Divider />

                    <Flex justifyContent="end" className="gap-6">
                        <a target="_blank" href={process.env.NEXT_PUBLIC_BACKEND_URL + 'api/stores/' + user?.meta.store_id + '/challans/' + challanID + '/excel?token=' + auth.token}>
                            <Button
                                color="gray"
                                variant="secondary"
                                icon={ReceiptPercentIcon}
                            >Export excel</Button>
                        </a>
                        <a target="_blank" href={process.env.NEXT_PUBLIC_BACKEND_URL + 'api/stores/' + user?.meta.store_id + '/challans/' + challanID + '/pdf?token=' + auth.token}>
                            <Button
                                icon={PrinterIcon}
                                variant="secondary"
                            >Export print</Button>
                        </a>
                    </Flex>
                </Card>
            </div>
        </div >
    )
}

export default isUser(ShowChallan, ['operator'])
