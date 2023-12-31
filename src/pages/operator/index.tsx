import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import {
    BackendGeneralResponse,
    ClosingCreateResponse,
    ClosingsResponse,
    OrdersResponse,
    StoreResponse,
    UserData,
} from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import StoreKPICards from '@/components/store/store-kpi-cards'
import StoreOrders from '@/components/store/store-orders'
import TableSkeleton from '@/components/table-skeleton'
import { Pagination, useDisclosure } from '@nextui-org/react'
import {
    Title,
    Text,
    Italic,
    Grid,
    Card,
    TabList,
    TabGroup,
    Tab,
    TabPanels,
    TabPanel,
    Flex,
    Button,
    List,
    ListItem,
    Subtitle,
    NumberInput,
    TextInput,
} from '@tremor/react'
import { Waveform } from '@uiball/loaders'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/modal'
import {
    ForwardIcon,
    XMarkIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import lodashSumBy from 'lodash/sumBy'
import { toast } from 'react-toastify'
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'

const Loading = () => (
    <Flex alignItems="center" justifyContent="center">
        <Waveform size={20} color="#3b82f6" />
    </Flex>
)

const LazyCreateOrder = dynamic(
    () => import('@/components/store/order/create-order'),
    {
        loading: () => <Loading />,
    },
)

const OperatorIndex = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData
    const queryClient = useQueryClient()

    const [index, setIndex] = useState<number>(0)

    const [orderSearch, setOrderSearch] = useState<string>('')
    const [bouncedOrderSearch] = useDebounce(orderSearch, 500)

    const [expense, setExpense] = useState<number>()
    const [remarks, setRemarks] = useState<string>()

    const [closingsPage, setClosingsPage] = useState<number>(1)
    const [ordersPage, setOrdersPage] = useState<number>(1)

    const closing = useDisclosure()
    const listClosing = useDisclosure()

    const getOrders = async (
        search: string = '',
        page: number = 1,
    ): Promise<OrdersResponse> => {
        const endpoint =
            search == ''
                ? `/stores/${user.store_id}/orders?page=${page}`
                : `/search/store/${user.store_id}/order?page=${page}`

        const response = await axios.get<OrdersResponse>(endpoint, {
            params: {
                search,
                include: ['customer'],
            },
        })

        return response.data
    }

    const {
        isLoading: isOrdersLoading,
        isError: isOrdersError,
        data: ordersUntyped,
    } = useQuery({
        queryKey: [
            'operator dashboard',
            user.store_id,
            bouncedOrderSearch,
            ordersPage,
        ],
        queryFn: () => getOrders(bouncedOrderSearch, ordersPage),
        initialData: keepPreviousData,
    })
    const orders = ordersUntyped as OrdersResponse

    const {
        isLoading: isClosingsLoading,
        isError: isClosingsError,
        data: closings,
    } = useQuery({
        queryKey: ['closings', user.store_id, closingsPage],
        placeholderData: keepPreviousData,
        queryFn: () =>
            axios.get<ClosingsResponse>(
                `/stores/${user.store_id}/closing?page=${closingsPage}`,
            ),
    })

    const {
        isLoading: isStoreLoading,
        isError: isStoreError,
        data: store,
    } = useQuery({
        queryKey: ['stores', user.store_id],
        queryFn: () =>
            axios.get<StoreResponse>('/stores/' + user.store_id, {
                params: {
                    include: [
                        'profile.state',
                        'profile.district',

                        'operators.user',
                        'operators.user.profile.state',
                        'operators.user.profile.district',
                    ],
                },
            }),
    })

    const { isError: isCreateClosingError, data: createClosing } = useQuery({
        queryKey: ['closings', user.store_id, 'create'],
        queryFn: () =>
            axios.get<ClosingCreateResponse[]>(
                '/stores/' + user.store_id + '/closing/create',
            ),
    })

    useEffect(() => {
        if (isStoreError) {
            toast.error('Unable to load store details')
        }

        if (isOrdersError) {
            toast.error('Unable to load orders')
        }

        if (isClosingsError) {
            toast.error('Unable to load list of closings')
        }

        if (isCreateClosingError) {
            toast.error('Unable to get day closing details')
        }
    }, [isStoreError, isOrdersError, isClosingsError, isCreateClosingError])

    const createDayClosing = useMutation({
        mutationFn: () =>
            axios.post<BackendGeneralResponse>(
                '/stores/' + store?.data.data.id + '/closing',
                {
                    expense,
                    remarks,
                },
            ),
        onSuccess: (result) => {
            toast.success(result.data.message)
            queryClient.invalidateQueries({
                queryKey: ['closings', user.store_id, 'create'],
            })
        },
        onError: () => toast.error('Cannot save day closing'),
        onSettled: () => closing.onClose(),
    })

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Operator dashboard for {store?.data.data.name}{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Grid numItemsLg={3} numItemsMd={3} className="gap-6">
                    <StoreKPICards store={store?.data} />
                </Grid>
            </div>

            <Card className="mt-4">
                <Grid
                    numItems={2}
                    numItemsMd={2}
                    numItemsLg={2}
                    numItemsSm={2}
                    className="gap-6"
                >
                    <Button
                        size="xs"
                        variant="light"
                        className="w-full"
                        onClick={() => listClosing.onOpen()}
                    >
                        View closings
                    </Button>

                    <Button
                        size="xs"
                        variant="secondary"
                        className="w-full"
                        onClick={() => closing.onOpen()}
                    >
                        Create closing
                    </Button>
                </Grid>
            </Card>

            <Card className="mt-4">
                <Title>Orders</Title>
                <Text>All the orders in your store</Text>
                <TabGroup className="mt-4" onIndexChange={setIndex}>
                    <TabList>
                        <Tab>List orders</Tab>
                        <Tab>Create order</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <TextInput
                                className="my-4"
                                value={orderSearch}
                                onInput={(e) =>
                                    setOrderSearch(e.currentTarget.value)
                                }
                                placeholder="Search orders..."
                            />
                            {isStoreLoading || isOrdersLoading ? (
                                <TableSkeleton numCols={7} numRows={5} />
                            ) : (
                                <>
                                    <StoreOrders
                                        store={store?.data}
                                        orders={orders}
                                        role="operator"
                                    />

                                    {orders.meta.last_page > 1 && (
                                        <Flex
                                            justifyContent="end"
                                            className="mt-4"
                                        >
                                            <Pagination
                                                total={orders.meta.last_page}
                                                onChange={setOrdersPage}
                                                page={ordersPage}
                                            />
                                        </Flex>
                                    )}
                                </>
                            )}
                        </TabPanel>
                        <TabPanel>
                            {index == 1 && (
                                <LazyCreateOrder
                                    store={store?.data as StoreResponse}
                                />
                            )}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>

            <Modal
                onOpenChange={listClosing.onOpenChange}
                isOpen={listClosing.isOpen}
                scrollBehavior="inside"
                backdrop="blur"
            >
                <ModalContent>
                    <ModalHeader>
                        <Title>All day closing</Title>
                    </ModalHeader>
                    <ModalBody>
                        {isClosingsLoading && <Loading />}
                        <List>
                            {closings?.data.data.map((closing) => (
                                <ListItem key={closing.id}>
                                    <span>
                                        {dayjs(closing?.created_at).format(
                                            'DD, MMMM YY',
                                        )}
                                    </span>
                                    <span>
                                        <a
                                            target="_blank"
                                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}api/stores/${user.store_id}/closing/${closing.id}?token=${user.token}`}
                                        >
                                            <Button
                                                variant="secondary"
                                                size="xs"
                                                color="gray"
                                                icon={ArrowDownTrayIcon}
                                            >
                                                Download
                                            </Button>
                                        </a>
                                    </span>
                                </ListItem>
                            ))}
                        </List>
                    </ModalBody>
                    <ModalFooter>
                        <Flex alignItems="center" justifyContent="between">
                            <Button
                                variant="light"
                                size="xs"
                                color="red"
                                onClick={listClosing.onClose}
                            >
                                Close
                            </Button>
                            {!isClosingsLoading &&
                                !isClosingsError &&
                                (closings?.data.meta.last_page as number) >
                                    1 && (
                                    <Pagination
                                        total={
                                            closings?.data.meta
                                                .last_page as number
                                        }
                                        page={closingsPage}
                                        onChange={setClosingsPage}
                                    />
                                )}
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                onOpenChange={closing.onOpenChange}
                isOpen={closing.isOpen}
                scrollBehavior="inside"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <Title>
                                    Day closing: {dayjs().format('DD, MMMM YY')}
                                </Title>
                            </ModalHeader>
                            <ModalBody>
                                <Subtitle>
                                    Income: ₹{' '}
                                    {lodashSumBy(
                                        createClosing?.data?.map(
                                            (c) => c.total_cost,
                                        ),
                                    ).toFixed(2)}
                                </Subtitle>
                                <List>
                                    <ListItem>
                                        <Text>UPI</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing?.data
                                                ?.filter(
                                                    (c) => c.mode == 'UPI',
                                                )?.[0]
                                                ?.total_cost.toFixed(2)}
                                        </Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text>Card</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing?.data
                                                ?.filter(
                                                    (c) => c.mode == 'Card',
                                                )?.[0]
                                                ?.total_cost.toFixed(2)}
                                        </Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text>Cash</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing?.data
                                                ?.filter(
                                                    (c) => c.mode == 'Cash',
                                                )?.[0]
                                                ?.total_cost.toFixed(2)}
                                        </Text>
                                    </ListItem>
                                </List>
                                <Subtitle>Expense</Subtitle>
                                <NumberInput
                                    value={expense}
                                    onValueChange={setExpense}
                                    placeholder="Enter expense..."
                                />
                                <TextInput
                                    value={remarks}
                                    onInput={(e) =>
                                        setRemarks(e.currentTarget.value)
                                    }
                                    placeholder="Enter reason..."
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    icon={XMarkIcon}
                                    variant="secondary"
                                    color="red"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    icon={ForwardIcon}
                                    loading={createDayClosing.isPending}
                                    loadingText="Creating day closing..."
                                    onClick={() => createDayClosing.mutate()}
                                >
                                    Create day closing
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default isUser(OperatorIndex, ['operator'])
