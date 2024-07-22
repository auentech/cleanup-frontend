import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import FormatNumber from '@/common/number-formatter'
import { Store, StoresResponse, UserData } from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import {
    ArchiveBoxArrowDownIcon,
    ArchiveBoxIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    BeakerIcon,
    BuildingStorefrontIcon,
    CheckIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    GiftIcon,
    ReceiptRefundIcon,
    ShoppingBagIcon,
    TicketIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionList,
    Button,
    Callout,
    Card,
    Col,
    DateRangePicker,
    DateRangePickerItem,
    DateRangePickerValue,
    Flex,
    Grid,
    Icon,
    List,
    ListItem,
    Metric,
    Text,
    TextInput,
    Title,
} from '@tremor/react'
import dayjs from 'dayjs'
import loFilter from 'lodash/filter'
import loSumBy from 'lodash/sumBy'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

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

    const [range, setRange] = useState<DateRangePickerValue>({
        from: dayjs().subtract(1, 'day').toDate(),
        to: dayjs().toDate(),
    })
    const [store, setStore] = useState<Store>()
    const [search, setSearch] = useState<string>('')
    const [debouncedSearch] = useDebounce(search, 300)

    const { data: stores } = useQuery({
        queryKey: ['search store', debouncedSearch],
        queryFn: ({ signal }) => axios.get<StoresResponse>('search/store', {
            signal,
            params: { search },
        }),
        select: data => data.data.data
    })

    const { data: metrics } = useQuery({
        queryKey: ['reports stores', store?.id, range.from, range.to],
        queryFn: ({ signal }) => axios.get<StoreReportsResponse>('reports/stores', {
            signal,
            params: {
                store_id: store?.id,
                from: range.from,
                to: range.to,
            },
        }),
        select: data => data.data,
        enabled: range.from != undefined,
    })

    return (
        <div className="p-12">
            <Title>Business reports</Title>
            <Text>Want to get a rundown of your whole business?</Text>

            <AdminNavigation />

            <Card className="mt-6">
                <Grid numItemsLg={2} numItemsMd={2} className="gap-6">
                    <Col numColSpan={1}>
                        {store == undefined ? (
                            <>
                                <TextInput
                                    onInput={(e) => setSearch(e.currentTarget.value)}
                                    placeholder="Search store..."
                                />

                                {search && stores && (
                                    <div className="mt-4">
                                        <List>
                                            {stores.map((theStore) => (
                                                <ListItem key={theStore.id}>
                                                    <Text>
                                                        {theStore.name} - {theStore.code} -{' '}
                                                        {theStore.profile?.district.name}
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        icon={CheckIcon}
                                                        variant="secondary"
                                                        onClick={(e) => setStore(theStore)}
                                                    >
                                                        Select store
                                                    </Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Callout title="Store selected">
                                Reports for {store.name} store with code {store.code} will be
                                displayed
                            </Callout>
                        )}
                    </Col>
                    <Col>
                        <DateRangePicker
                            value={range}
                            className="max-w-full"
                            onValueChange={setRange}
                            placeholder="Select range"
                        >
                            <DateRangePickerItem
                                from={dayjs().subtract(1, 'day').toDate()}
                                value="today"
                            >
                                Today
                            </DateRangePickerItem>
                            <DateRangePickerItem
                                from={dayjs().subtract(7, 'day').toDate()}
                                value="7days"
                            >
                                Last 7 days
                            </DateRangePickerItem>
                            <DateRangePickerItem
                                from={dayjs().subtract(30, 'days').toDate()}
                                value="30days"
                            >
                                Last 30 days
                            </DateRangePickerItem>
                        </DateRangePicker>
                    </Col>
                </Grid>
            </Card>

            {metrics && (
                <>
                    <div className="mt-6">
                        <Title>Order details</Title>
                        <Grid numItemsLg={5} numItemsMd={3} className="mt-4 gap-6">
                            <Card decoration="top" decorationColor="blue">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={ClockIcon} variant="light" color="blue" size="xl" />
                                    <div className="truncate">
                                        <Title>In Store</Title>
                                        <Metric>
                                            {loFilter(
                                                metrics?.count,
                                                (count) => count.status == 'received',
                                            )?.[0]?.status_count || 0}
                                        </Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="orange">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={BuildingStorefrontIcon}
                                        variant="light"
                                        color="orange"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>Undelivered</Title>
                                        <Metric>
                                            {loFilter(
                                                metrics?.count,
                                                (count) => count.status == 'processed',
                                            )?.[0]?.status_count || 0}
                                        </Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="fuchsia">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={BeakerIcon}
                                        variant="light"
                                        color="fuchsia"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>In Factory</Title>
                                        <Metric>
                                            {loFilter(
                                                metrics?.count,
                                                (count) => count.status == 'in_process',
                                            )?.[0]?.status_count || 0}
                                        </Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="teal">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={ArchiveBoxArrowDownIcon}
                                        variant="light"
                                        color="teal"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>Delivered</Title>
                                        <Metric>
                                            {loFilter(
                                                metrics?.count,
                                                (count) => count.status == 'delivered',
                                            )?.[0]?.status_count || 0}
                                        </Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="indigo">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={ReceiptRefundIcon}
                                        variant="light"
                                        color="indigo"
                                        size="xl"
                                    />
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
                        <Grid numItemsLg={5} numItemsMd={3} className="mt-4 gap-6">
                            <Card decoration="top" decorationColor="blue">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={ArchiveBoxIcon}
                                        variant="light"
                                        color="blue"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>Orders</Title>
                                        <Metric>{loSumBy(metrics.count, 'status_count')}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="orange">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={CurrencyRupeeIcon}
                                        variant="light"
                                        color="orange"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>Billing</Title>
                                        <Metric>₹ {FormatNumber(Number(metrics.numbers[0].total_cost || 0))}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="fuchsia">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={TicketIcon}
                                        variant="light"
                                        color="fuchsia"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>Collected</Title>
                                        <Metric>₹ {FormatNumber(Number(metrics.numbers[0].total_paid || 0))}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="teal">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon icon={GiftIcon} variant="light" color="teal" size="xl" />
                                    <div className="truncate">
                                        <Title>Discount</Title>
                                        <Metric>₹ {FormatNumber(Number(metrics.numbers[0].total_discount || 0))}</Metric>
                                    </div>
                                </Flex>
                            </Card>

                            <Card decoration="top" decorationColor="indigo">
                                <Flex justifyContent="start" className="space-x-6">
                                    <Icon
                                        icon={ArrowPathIcon}
                                        variant="light"
                                        color="indigo"
                                        size="xl"
                                    />
                                    <div className="truncate">
                                        <Title>Balance</Title>
                                        <Metric>
                                            ₹{' '}
                                            {(() => {
                                                const total =
                                                    parseInt(metrics.numbers[0].total_cost) || 0
                                                const paid =
                                                    parseInt(metrics.numbers[0].total_paid) || 0
                                                return FormatNumber(total - paid)
                                            })()}
                                        </Metric>
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
                                    <Grid numItemsLg={3} className="mb-4 mt-4 gap-6">
                                        <Card decoration="top" decorationColor="teal">
                                            <Flex justifyContent="start" className="space-x-6">
                                                <Icon
                                                    icon={ArchiveBoxArrowDownIcon}
                                                    variant="light"
                                                    color="teal"
                                                    size="xl"
                                                />
                                                <div className="truncate">
                                                    <Title>Washed</Title>
                                                    <Metric>
                                                        {loFilter(
                                                            metrics?.status,
                                                            (count) => count.action == 'washed',
                                                        )?.[0]?.action_count || 0}
                                                    </Metric>
                                                </div>
                                            </Flex>
                                        </Card>

                                        <Card decoration="top" decorationColor="indigo">
                                            <Flex justifyContent="start" className="space-x-6">
                                                <Icon
                                                    icon={CheckIcon}
                                                    variant="light"
                                                    color="indigo"
                                                    size="xl"
                                                />
                                                <div className="truncate">
                                                    <Title>Ironed</Title>
                                                    <Metric>
                                                        {loFilter(
                                                            metrics?.status,
                                                            (count) => count.action == 'ironed',
                                                        )?.[0]?.action_count || 0}
                                                    </Metric>
                                                </div>
                                            </Flex>
                                        </Card>

                                        <Card decoration="top" decorationColor="purple">
                                            <Flex justifyContent="start" className="space-x-6">
                                                <Icon
                                                    icon={ShoppingBagIcon}
                                                    variant="light"
                                                    color="purple"
                                                    size="xl"
                                                />
                                                <div className="truncate">
                                                    <Title>Packed</Title>
                                                    <Metric>
                                                        {loFilter(
                                                            metrics?.status,
                                                            (count) => count.action == 'packed',
                                                        )?.[0]?.action_count || 0}
                                                    </Metric>
                                                </div>
                                            </Flex>
                                        </Card>
                                    </Grid>
                                </AccordionBody>
                            </Accordion>
                        </AccordionList>
                    </div>

                    <Card className="mt-4">
                        <Title className="mb-2">Downloads</Title>
                        <Grid numItemsMd={4} className="gap-6">
                            <a
                                href={(() => {
                                    const url = new URL('api/reports/exports/stores', process.env.NEXT_PUBLIC_BACKEND_URL!)

                                    url.searchParams.append('from', dayjs(range.from).format('YYYY-MM-DD'))
                                    url.searchParams.append('to', dayjs(range.to).format('YYYY-MM-DD'))
                                    url.searchParams.append('token', user.token!)
                                    url.searchParams.append('store_id', store?.id + '')

                                    return url.toString()
                                })()}
                                className="w-full"
                                target="_blank"
                            >
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    icon={ArrowDownTrayIcon}
                                >
                                    Download report
                                </Button>
                            </a>
                            <a
                                href={`${process.env.NEXT_PUBLIC_BACKEND_URL
                                    }api/reports/exports/customers?from=${dayjs(range.from).format(
                                        'YYYY-MM-DD',
                                    )}&to=${dayjs(range.to).format('YYYY-MM-DD')}&token=${user.token}`}
                                className="w-full"
                                target="_blank"
                            >
                                <Button className="w-full" variant="secondary" icon={UsersIcon}>
                                    Download users
                                </Button>
                            </a>
                            <a
                                href={(() => {
                                    const url = new URL('api/reports/exports/collection', process.env.NEXT_PUBLIC_BACKEND_URL!)

                                    url.searchParams.append('from', dayjs(range.from).format('YYYY-MM-DD'))
                                    url.searchParams.append('to', dayjs(range.to).format('YYYY-MM-DD'))
                                    url.searchParams.append('token', user.token!)
                                    url.searchParams.append('store_id', store?.id + '')

                                    return url.toString()
                                })()}
                                className="w-full"
                                target="_blank"
                            >
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                >
                                    Collection report
                                </Button>
                            </a>
                            <a
                                href={`${process.env.NEXT_PUBLIC_BACKEND_URL
                                    }api/reports/exports/undelivered/${store?.id}?from=${dayjs(
                                        range.from,
                                    ).format('YYYY-MM-DD')}&to=${dayjs(range.to).format(
                                        'YYYY-MM-DD',
                                    )}&token=${user.token}`}
                                className="w-full"
                                target="_blank"
                            >
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    disabled={store == undefined}
                                >
                                    Undelivered reports
                                </Button>
                            </a>
                        </Grid>
                    </Card>
                </>
            )}
        </div>
    )
}

export default isUser(AdminReports, ['admin'])
