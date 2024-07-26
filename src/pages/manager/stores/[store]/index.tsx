import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { OrdersResponse, Store, StoreResponse } from '@/common/types'
import {
    ArrowLeftIcon,
    BuildingStorefrontIcon,
    MoonIcon,
    PencilIcon,
    ReceiptPercentIcon,
} from '@heroicons/react/24/outline'
import {
    Badge,
    Card,
    Flex,
    Grid,
    Icon,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
    Text,
    Title,
} from '@tremor/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import StoreKPICards from '@/components/store/store-kpi-cards'
import StoreOrders from '@/components/store/store-orders'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { Pagination } from '@nextui-org/react'
import TableSkeleton from '@/components/table-skeleton'
import Loading from '@/components/loading'
import ManagerNavigation from '@/components/manager/manager-navigation'

const LazyEditStore = dynamic(() => import('@/components/admin/edit-store'), {
    loading: () => <Loading />,
})
const LazyClosingsList = dynamic(() => import('@/components/store/store-closings'), {
    loading: () => <Loading />,
})

const ShowStore = () => {
    const axios = useAxios()
    const router = useRouter()

    const [page, setPage] = useState<number>(1)
    const [theIndex, setTheIndex] = useState<number>(0)

    const {
        data: store,
        isLoading: isStoreLoading,
        isError: isStoreError,
    } = useQuery({
        queryKey: ['store', router.query.store],
        queryFn: ({ signal }) =>
            axios.get<StoreResponse>('/stores/' + router.query.store, {
                params: {
                    include: [
                        'profile.state',
                        'profile.district',

                        'operators.user',
                        'operators.user.profile.state',
                        'operators.user.profile.district',
                    ],
                },
                signal,
            }),
        select: (data) => data.data,
    })

    const {
        data: orders,
        isLoading: isOrdersLoading,
        isError: isOrdersError,
    } = useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['store', router.query.store, 'orders', page],
        queryFn: ({ signal }) =>
            axios.get<OrdersResponse>('/stores/' + router.query.store + '/orders', {
                params: {
                    page,
                    include: ['customer'],
                    filter: {
                        originals: 'yes',
                    },
                },
                signal,
            }),
        select: data => data.data,
    })

    return (
        <div className="p-12">
            <div>
                <Flex justifyContent="start">
                    <Icon
                        icon={ArrowLeftIcon}
                        onClick={() => router.back()}
                        style={{ cursor: 'pointer' }}
                    ></Icon>
                    <Title>{store?.data.name} store</Title>
                    <Badge icon={BuildingStorefrontIcon} size="xs" className="ml-4">
                        {store?.data.code}
                    </Badge>
                </Flex>
                <Text>Store located at: {store?.data?.profile?.address}</Text>

                <ManagerNavigation />

                <div className="mt-6">
                    <Grid numItemsLg={3} numItemsMd={3} className="gap-6">
                        {store != undefined && <StoreKPICards store={store} />}
                    </Grid>
                </div>

                <div className="mt-6">
                    <Card>
                        <TabGroup index={theIndex} onIndexChange={setTheIndex}>
                            <TabList variant="solid">
                                <Tab icon={ReceiptPercentIcon}>Orders</Tab>
                                <Tab icon={PencilIcon}>Settings</Tab>
                                <Tab icon={MoonIcon}>Closings</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel className="mt-6">
                                    <Title>Orders</Title>
                                    <Text>All the orders in your store</Text>

                                    <div className="mt-4">
                                        {isOrdersLoading ? (
                                            <TableSkeleton numCols={8} numRows={10} />
                                        ) : (
                                            <>
                                                <StoreOrders
                                                    store={store}
                                                    orders={orders}
                                                    role="manager"
                                                />

                                                {orders?.meta.last_page! > 1 && (
                                                    <Flex justifyContent="end" className="mt-4">
                                                        <Pagination
                                                            total={orders?.meta.last_page!}
                                                            onChange={setPage}
                                                            page={page}
                                                        />
                                                    </Flex>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TabPanel>

                                <TabPanel className="mt-6">
                                    <Title>Edit store</Title>
                                    <Text>Did not like something? Time to change that</Text>

                                    {theIndex == 1 && <LazyEditStore />}
                                </TabPanel>

                                <TabPanel className="mt-6">
                                    {theIndex == 2 && (
                                        <LazyClosingsList store={store?.data as Store} />
                                    )}
                                </TabPanel>
                            </TabPanels>
                        </TabGroup>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default isUser(ShowStore, ['manager'])
