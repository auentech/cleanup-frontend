import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import {
    BackendGeneralResponse,
    ClosingCreateResponse,
    OrdersResponse,
    StoreResponse,
    UserData,
} from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import StoreKPICards from '@/components/store/store-kpi-cards'
import StoreOrders from '@/components/store/store-orders'
import TableSkeleton from '@/components/table-skeleton'
import { useDisclosure } from '@nextui-org/react'
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
import { ForwardIcon, XMarkIcon } from '@heroicons/react/24/outline'
import dayjs from 'dayjs'
import { AxiosError, isAxiosError } from 'axios'
import { useRouter } from 'next/router'
import lodashSumBy from 'lodash/sumBy'

const LazyCreateOrder = dynamic(
    () => import('@/components/store/order/create-order'),
    {
        loading: () => (
            <Flex alignItems="center" justifyContent="center">
                <Waveform size={20} color="#3b82f6" />
            </Flex>
        ),
    },
)

const OperatorIndex = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()
    const user = data?.user as UserData

    const [index, setIndex] = useState<number>(0)
    const [store, setStore] = useState<StoreResponse>()
    const [orders, setOrders] = useState<OrdersResponse>()

    const [expense, setExpense] = useState<number>()
    const [remarks, setRemarks] = useState<string>()
    const [closingLoading, setClosingLoading] = useState<boolean>()
    const [createClosing, setCreateClosing] =
        useState<ClosingCreateResponse[]>()

    const closing = useDisclosure()

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

            const ordersResponse = await axios.get<OrdersResponse>(
                '/stores/' + user.store_id + '/orders',
                {
                    params: {
                        include: ['customer'],
                        filter: {
                            originals: 'yes',
                        },
                    },
                },
            )

            const closingResponse = await axios.get<ClosingCreateResponse[]>(
                '/stores/' + user.store_id + '/closing/create',
            )

            setStore(storeResponse.data)
            setOrders(ordersResponse.data)
            setCreateClosing(closingResponse.data)
        }

        fetchData()
    }, [])

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

            alert(createClosingResponse.data.message)
            router.reload()
        } catch (e) {
            if (isAxiosError(e)) {
                const error = e as AxiosError
                const data = error.response?.data as BackendGeneralResponse

                alert(data.message)
                router.reload()
            }
        } finally {
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
                <Grid numItemsLg={4} numItemsMd={2} className="gap-6">
                    <StoreKPICards store={store} />
                </Grid>
            </div>

            <Card className="mt-6">
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
                                <StoreOrders
                                    store={store}
                                    orders={orders}
                                    role="operator"
                                />
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

            <Card className="mt-4">
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={(e) => closing.onOpen()}
                >
                    Create day closing
                </Button>
            </Card>

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
                                        createClosing?.map((c) =>
                                            parseFloat(c.total_cost),
                                        ),
                                    )}
                                </Subtitle>
                                <List>
                                    <ListItem>
                                        <Text>UPI</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing?.filter(
                                                (c) => c.mode == 'UPI',
                                            )?.[0]?.total_cost ?? 0}
                                        </Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text>Card</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing?.filter(
                                                (c) => c.mode == 'Card',
                                            )?.[0]?.total_cost ?? 0}
                                        </Text>
                                    </ListItem>
                                    <ListItem>
                                        <Text>Cash</Text>
                                        <Text>
                                            ₹{' '}
                                            {createClosing?.filter(
                                                (c) => c.mode == 'Cash',
                                            )?.[0]?.total_cost ?? 0}
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
