import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { Store, StoresResponse, UserData } from "@/common/types"
import AdminNavigation from "@/components/admin/admin-navigation"
import { ArchiveBoxArrowDownIcon, ArchiveBoxIcon, ArrowDownTrayIcon, ArrowPathIcon, BeakerIcon, BuildingStorefrontIcon, CheckIcon, ClockIcon, CurrencyRupeeIcon, GiftIcon, ReceiptRefundIcon, TicketIcon } from "@heroicons/react/24/outline"
import { Accordion, AccordionBody, AccordionHeader, AccordionList, Button, Callout, Card, Col, Flex, Grid, Icon, List, ListItem, Metric, Select, SelectItem, Text, TextInput, Title } from "@tremor/react"
import loFilter from 'lodash/filter'
import loSumBy from 'lodash/sumBy'
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

type StoreCount = {
    status: 'received' | 'in_process' | 'processed' | 'delivered'
    status_count: number
}

type FactoryCount = {
    action: 'washed' | 'ironed' | 'packed'
    action_count: number
}

type StoreReportsResponse = {
    count: StoreCount[]
    status: FactoryCount[]
    numbers: {
        total_cost: string
        total_paid: string
        total_discount: string
    }[]
    rewash: number
}

const AdminReports = () => {
    const axios = useAxios()
    const { data } = useSession()

    const user = data?.user as UserData

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
            console.log(response.data)
        }

        initData()
    }, [selectedStore, selectedRange])

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
                        <Grid numItemsLg={5} numItemsMd={3} className="gap-6 mt-4">
                            <Card decoration="top" decorationColor="blue">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ClockIcon} variant="light" color="blue" size="xl" />
                                    <div className="truncate">
                                        <Title>In Store</Title>
                                        <Metric>{loFilter(metrics?.count, count => count.status == 'received')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="orange">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={BuildingStorefrontIcon} variant="light" color="orange" size="xl" />
                                    <div className="truncate">
                                        <Title>Undelivered</Title>
                                        <Metric>{loFilter(metrics?.count, count => count.status == 'processed')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="fuchsia">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={BeakerIcon} variant="light" color="fuchsia" size="xl" />
                                    <div className="truncate">
                                        <Title>In Factory</Title>
                                        <Metric>{loFilter(metrics?.count, count => count.status == 'in_process')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="teal">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ArchiveBoxArrowDownIcon} variant="light" color="teal" size="xl" />
                                    <div className="truncate">
                                        <Title>Delivered</Title>
                                        <Metric>{loFilter(metrics?.count, count => count.status == 'delivered')?.[0]?.status_count || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="indigo">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ReceiptRefundIcon} variant="light" color="indigo" size="xl" />
                                    <div className="truncate">
                                        <Title>Rewashes</Title>
                                        <Metric>{metrics.rewash}</Metric>
                                    </div>
                                </Flex>
                            </Card>
                        </Grid>
                    </div>

                    <div className="mt-6">
                        <Title>Order totals</Title>
                        <Grid numItemsLg={5} numItemsMd={3} className="gap-6 mt-4">
                            <Card decoration="top" decorationColor="blue">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ArchiveBoxIcon} variant="light" color="blue" size="xl" />
                                    <div className="truncate">
                                        <Title>Orders</Title>
                                        <Metric>{loSumBy(metrics.count, 'status_count')}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="orange">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={CurrencyRupeeIcon} variant="light" color="orange" size="xl" />
                                    <div className="truncate">
                                        <Title>Billing</Title>
                                        <Metric>₹ {metrics.numbers[0].total_cost || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="fuchsia">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={TicketIcon} variant="light" color="fuchsia" size="xl" />
                                    <div className="truncate">
                                        <Title>Collected</Title>
                                        <Metric>₹ {metrics.numbers[0].total_paid || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="teal">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={GiftIcon} variant="light" color="teal" size="xl" />
                                    <div className="truncate">
                                        <Title>Discount</Title>
                                        <Metric>₹ {metrics.numbers[0].total_discount || 0}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="indigo">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ArrowPathIcon} variant="light" color="indigo" size="xl" />
                                    <div className="truncate">
                                        <Title>Balance</Title>
                                        <Metric>₹ {(() => {
                                            const total = parseInt(metrics.numbers[0].total_cost) || 0
                                            const paid = parseInt(metrics.numbers[0].total_paid) || 0
                                            return total - paid
                                        })()}</Metric>
                                    </div>
                                </Flex>
                            </Card>
                        </Grid>
                    </div>

                    <div className="mt-6">
                        <AccordionList>
                            <Accordion>
                                <AccordionHeader>Factory reports</AccordionHeader>
                                <AccordionBody>
                                    <Grid numItemsLg={3} className="gap-6 mt-4 mb-4">
                                        <Card decoration="top" decorationColor="teal">
                                            <Flex justifyContent="start" className="space-x-6">
                                                <Icon icon={GiftIcon} variant="light" color="teal" size="xl" />
                                                <div className="truncate">
                                                    <Title>Washed</Title>
                                                    <Metric>{loFilter(metrics?.status, count => count.action == 'washed')?.[0]?.action_count || 0}</Metric>
                                                </div>
                                            </Flex>
                                        </Card>

                                        <Card decoration="top" decorationColor="teal">
                                            <Flex justifyContent="start" className="space-x-6">
                                                <Icon icon={GiftIcon} variant="light" color="teal" size="xl" />
                                                <div className="truncate">
                                                    <Title>Ironed</Title>
                                                    <Metric>{loFilter(metrics?.status, count => count.action == 'ironed')?.[0]?.action_count || 0}</Metric>
                                                </div>
                                            </Flex>
                                        </Card>

                                        <Card decoration="top" decorationColor="teal">
                                            <Flex justifyContent="start" className="space-x-6">
                                                <Icon icon={GiftIcon} variant="light" color="teal" size="xl" />
                                                <div className="truncate">
                                                    <Title>Packed</Title>
                                                    <Metric>{loFilter(metrics?.status, count => count.action == 'packed')?.[0]?.action_count || 0}</Metric>
                                                </div>
                                            </Flex>
                                        </Card>
                                    </Grid>
                                </AccordionBody>
                            </Accordion>
                        </AccordionList>
                    </div>

                    {selectedRange != '1' && (
                        <Card className="mt-4">
                            <Link href={process.env.NEXT_PUBLIC_BACKEND_URL + '/api/reports/exports/stores?token=' + user.token}>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={ArrowDownTrayIcon}
                                >
                                    Download report
                                </Button>
                            </Link>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

export default isUser(AdminReports, ['admin'])
