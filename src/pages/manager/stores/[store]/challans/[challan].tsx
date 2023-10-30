import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { DeliveryChallanResponse } from "@/common/types"
import { ArchiveBoxIcon, BuildingStorefrontIcon, CodeBracketIcon, CurrencyRupeeIcon, PrinterIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline"
import { Title, Text, Grid, Card, Flex, Icon, Metric, Table, TableRow, Button, Divider, TableHead, TableHeaderCell, TableBody, TableCell } from "@tremor/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import sumBy from "lodash/sumBy"
import Link from "next/link"
import ManagerNavigation from "@/components/manager/manager-navigation"

const ShowChallan = () => {
    const axios = useAxios()
    const router = useRouter()

    const storeID = router.query.store
    const challanID = router.query.challan

    const [challan, setChallan] = useState<DeliveryChallanResponse>()

    const [pdfLoading, setPdfLoading] = useState<boolean>(false)
    const [excelLoading, setExcelLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            const challanResponse = await axios.get<DeliveryChallanResponse>('/stores/' + storeID + '/challans/' + challanID, {
                params: {
                    include: ['store', 'orders']
                }
            })

            setChallan(challanResponse.data)
        }

        fetchData()
    }, [])

    const handleExcelExport = async () => {
        setExcelLoading(true)
        const response = await axios.post('stores/' + storeID + '/challans/' + challanID + '/excel', {
            responseType: 'blob'
        })

        const blobURL = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = blobURL
        link.download = 'DeliveryChallan-' + challanID + '.xlsx'
        link.click()
        window.URL.revokeObjectURL(blobURL)
        setExcelLoading(false)
    }

    const handlePdfExport = async () => {
        setPdfLoading(true)
        const response = await axios.post('stores/' + storeID + '/challans/' + challanID + '/pdf', {
            responseType: 'blob'
        })

        const blobURL = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = blobURL
        link.download = 'DeliveryChallan-' + challanID + '.pdf'
        link.click()
        window.URL.revokeObjectURL(blobURL)
        setPdfLoading(false)
    }

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

            <ManagerNavigation />

            <div className="mt-6">
                <Card>
                    <Title>Challan items</Title>
                    <Text>All orders added to this delivery challan</Text>

                    <Table className="mt-4">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Order code</TableHeaderCell>
                                <TableHeaderCell>No. of garments</TableHeaderCell>
                                <TableHeaderCell>Cost</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {challan?.data.orders?.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.code}</TableCell>
                                    <TableCell>{order.count}</TableCell>
                                    <TableCell>{order.cost}</TableCell>
                                    <TableCell>
                                        <Link href={'/manager/stores/' + challan.data.store?.id + '/orders/' + order.code}>
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
                        <Button
                            color="gray"
                            variant="secondary"
                            loading={excelLoading}
                            icon={ReceiptPercentIcon}
                            onClick={handleExcelExport}
                            loadingText="Generating excel..."
                        >Export excel</Button>
                        <Button
                            icon={PrinterIcon}
                            variant="secondary"
                            loading={pdfLoading}
                            onClick={handlePdfExport}
                            loadingText="Generating print..."
                        >Export print</Button>
                    </Flex>
                </Card>
            </div>
        </div>
    )
}

export default isUser(ShowChallan, ['manager'])
