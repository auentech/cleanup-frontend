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
import { AxiosError, isAxiosError } from 'axios'
import lodashSumBy from 'lodash/sumBy'
import { toast } from 'react-toastify'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

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

    const [index, setIndex] = useState<number>(0)
    const [store, setStore] = useState<StoreResponse>()
    const [orders, setOrders] = useState<OrdersResponse>()

    const [orderSearch, setOrderSearch] = useState<string>()
    const [expense, setExpense] = useState<number>()
    const [remarks, setRemarks] = useState<string>()
    const [closingLoading, setClosingLoading] = useState<boolean>()
    const [createClosing, setCreateClosing] =
        useState<ClosingCreateResponse[]>()
    const [closingsPage, setClosingsPage] = useState<number>(1)

    const closing = useDisclosure()
    const listClosing = useDisclosure()

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

    useEffect(() => {
        const fetchData = async () => {
            const user = data?.user as UserData
            const storeResponse = await axios.get<StoreResponse>(
                '/stores/' + user.store_id,
                {
                    params: {
                        include: [
                            'profile.state',
                            'profile.district',

                            'operators.user',
                            'operators.user.profile.state',
                            'operators.user.profile.district',
                        ],
                    },
                },
            )

            const closingResponse = await axios.get<ClosingCreateResponse[]>(
                '/stores/' + user.store_id + '/closing/create',
            )

            setStore(storeResponse.data)
            setCreateClosing(closingResponse.data)
        }

        fetchData()
    }, [])

    useEffect(() => {
        const fetchOrders = async () => {
            const searchResponse = await axios.get<OrdersResponse>(
                '/search/store/' + user.store_id + '/order',
                {
                    params: {
                        originals: true,
                        search: orderSearch,
                    },
                },
            )

            setOrders(searchResponse.data)
        }

        fetchOrders()
    }, [orderSearch])

    const createDayClosing = async () => {
        setClosingLoading(true)

        try {
            const createClosingResponse =
                await axios.post<BackendGeneralResponse>(
                    '/stores/' + store?.data.id + '/closing',
                    {
                        expense,
                        remarks,
                    },
                )

            toast.success(createClosingResponse.data.message)
        } catch (e) {
            if (isAxiosError(e)) {
                const error = e as AxiosError
                const data = error.response?.data as BackendGeneralResponse

                toast.error(data.message)
            }
        } finally {
            closing.onClose()
            setClosingLoading(false)
        }
    }

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Operator dashboard for {store?.data.name}{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Grid numItemsLg={3} numItemsMd={3} className="gap-6">
                    <StoreKPICards store={store} />
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
                            {store == undefined || orders == undefined ? (
                                <TableSkeleton numCols={7} numRows={5} />
                            ) : (
                                <>
                                    <TextInput
                                        className="my-4"
                                        value={orderSearch}
                                        onInput={(e) =>
                                            setOrderSearch(
                                                e.currentTarget.value,
                                            )
                                        }
                                        placeholder="Search orders..."
                                    />
                                    <StoreOrders
                                        store={store}
                                        orders={orders}
                                        role="operator"
                                    />
                                </>
                            )}
                        </TabPanel>
                        <TabPanel>
                            {index == 1 && (
                                <LazyCreateOrder
                                    store={store as StoreResponse}
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
                                        <Button
                                            variant="secondary"
                                            size="xs"
                                            color="gray"
                                            icon={ArrowDownTrayIcon}
                                        >
                                            Download
                                        </Button>
                                    </span>
                                </ListItem>
                            ))}
                        </List>
                    </ModalBody>
                    <ModalFooter>
                        <Flex alignItems="center" justifyContent="between">
                            <Button variant="light" size="xs" color="red">
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
                                        createClosing?.map((c) => c.total_cost),
                                    ).toFixed(2)}
                                </Subtitle>
                                <List>
                                    <ListItem>
                                        <Text>UPI</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing
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
                                            {createClosing
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
                                            {createClosing
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
                                    loading={closingLoading}
                                    loadingText="Creating day closing..."
                                    onClick={createDayClosing}
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
