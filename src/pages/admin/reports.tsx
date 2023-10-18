import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { Store, StoresResponse } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import { ArchiveBoxArrowDownIcon, ArchiveBoxIcon, ArrowDownTrayIcon, BeakerIcon, BuildingStorefrontIcon, CheckIcon, ClockIcon, CurrencyRupeeIcon, GiftIcon, ReceiptRefundIcon, TicketIcon } from "@heroicons/react/24/outline"
import { Button, Callout, Card, Col, Flex, Grid, Icon, List, ListItem, Metric, Select, SelectItem, Text, TextInput, Title } from "@tremor/react"
import _ from "lodash"
import { useEffect, useState } from "react"

type StoreCount = {
    status: 'received' | 'in_process' | 'processed' | 'delivered'
    status_count: number
}

type StoreReportsResponse = {
    count: StoreCount[]
    numbers: {
        total_cost: string
        total_paid: string
        total_discount: string
    }[]
}

const AdminReports = () => {
    const axios = useAxios()

    const [excelExportLoading, setExcelExportLoading] = useState<boolean>(false)

    const [stores, setStores] = useState<Store[]>()
    const [search, setSearch] = useState<string>('')
    const [selectedStore, setSelectedStore] = useState<Store>()
    const [selectedRange, setSelectedRange] = useState<string>()
    const [metrics, setMetrics] = useState<StoreReportsResponse>()

    useEffect(() => {
        const searchStore = async () => {
            const storesResponse = await axios.get<StoresResponse>('search/store', {
                params: { search }
            })

            setStores(storesResponse.data.data)
        }

        searchStore()
    }, [search])

    useEffect(() => {
        const initData = async () => {
            const response = await axios.get<StoreReportsResponse>('reports/stores', {
                params: {
                    store_id: selectedStore?.id,
                    days: selectedRange
                }
            })

            setMetrics(response.data)
        }

        initData()
    }, [selectedStore, selectedRange])

    const handleExcelExport = async () => {
        setExcelExportLoading(true)
        const response = await axios.get('reports/exports/stores', {
            responseType: 'blob',
            params: {
                store_id: selectedStore?.id,
                date: selectedRange
            }
        })

        const blobURL = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = blobURL
        link.download = 'store-reports.xlsx'
        link.click()
        window.URL.revokeObjectURL(blobURL)
        setExcelExportLoading(false)
    }

    return (
        <div className="p-12">
            <Title>Business reports</Title>
            <Text>Want to get a rundown of your whole business?</Text>

            <AdminNavigation />

            <Card className="mt-6">
                <Grid numItemsLg={2} numItemsMd={2} className="gap-6">
                    <Col numColSpan={1}>
                        {selectedStore == undefined ? (
                            <>
                                <TextInput onInput={e => setSearch(e.currentTarget.value)} placeholder="Search store..." />

                                {(search && stores) && (
                                    <div className="mt-4">
                                        <List>
                                            {stores.map(theStore => (
                                                <ListItem key={theStore.id}>
                                                    <Text>
                                                        {theStore.name} - {theStore.code} - {theStore.profile?.district.name}
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        icon={CheckIcon}
                                                        variant="secondary"
                                                        onClick={e => setSelectedStore(theStore)}
                                                    >Select store
                                                    </Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Callout title="Store selected">
                                Reports for {selectedStore.name} store with code {selectedStore.code} will be displayed
                            </Callout>
                        )}
                    </Col>
                    <Col>
                        <Select onValueChange={setSelectedRange} placeholder="Select range">
                            <SelectItem value="1">Today's data</SelectItem>
                            <SelectItem value="7">Last 7 day's data</SelectItem>
                            <SelectItem value="30">Last 30 day's data</SelectItem>
                            <SelectItem value="365">Last 365 day's data</SelectItem>
                        </Select>
                    </Col>
                </Grid>
            </Card>

            {metrics && (
                <>
                    <div className="mt-6">
                        <Title>Order details</Title>
                        <Grid numItemsLg={4} className="gap-6 mt-4">
                            <Card decoration="top" decorationColor="blue">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ClockIcon} variant="light" color="blue" size="xl" />
                                    <div className="truncate">
                                        <Title>Unprocessed orders</Title>
                                        <Metric>{_.filter(metrics?.count, count => count.status == 'received')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="orange">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={BuildingStorefrontIcon} variant="light" color="orange" size="xl" />
                                    <div className="truncate">
                                        <Title>In Store orders</Title>
                                        <Metric>{_.filter(metrics?.count, count => count.status == 'processed')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="fuchsia">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={BeakerIcon} variant="light" color="fuchsia" size="xl" />
                                    <div className="truncate">
                                        <Title>In Factory orders</Title>
                                        <Metric>{_.filter(metrics?.count, count => count.status == 'in_process')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="teal">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ArchiveBoxArrowDownIcon} variant="light" color="teal" size="xl" />
                                    <div className="truncate">
                                        <Title>Delivered orders</Title>
                                        <Metric>{_.filter(metrics?.count, count => count.status == 'delivered')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>
                        </Grid>
                    </div>

                    <div className="mt-6">
                        <Title>Order totals</Title>
                        <Grid numItemsLg={4} className="gap-6 mt-4">
                            <Card decoration="top" decorationColor="blue">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ArchiveBoxIcon} variant="light" color="blue" size="xl" />
                                    <div className="truncate">
                                        <Title>Total orders</Title>
                                        <Metric>{_.sumBy(metrics.count, 'status_count')}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="orange">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={CurrencyRupeeIcon} variant="light" color="orange" size="xl" />
                                    <div className="truncate">
                                        <Title>Total billing</Title>
                                        <Metric>₹ {metrics.numbers[0].total_cost || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="fuchsia">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={TicketIcon} variant="light" color="fuchsia" size="xl" />
                                    <div className="truncate">
                                        <Title>Total collected</Title>
                                        <Metric>₹ {metrics.numbers[0].total_paid || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="teal">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={GiftIcon} variant="light" color="teal" size="xl" />
                                    <div className="truncate">
                                        <Title>Total discount</Title>
                                        <Metric>₹ {metrics.numbers[0].total_discount || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>
                        </Grid>
                    </div>

                    {selectedRange != '1' && (
                        <Card className="mt-4">
                            <Button
                                className="w-full"
                                variant="secondary"
                                icon={ArrowDownTrayIcon}
                                onClick={handleExcelExport}
                                loading={excelExportLoading}
                                loadingText="Generating excel report..."
                            >
                                Download report
                            </Button>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

export default isUser(AdminReports, ['admin'])
