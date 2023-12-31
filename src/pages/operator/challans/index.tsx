import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import {
    DeliveryChallansResponse,
    LoginResponse,
    UserData,
} from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import TableSkeleton from '@/components/table-skeleton'
import {
    BeakerIcon,
    BuildingStorefrontIcon,
    PlusCircleIcon,
    ReceiptRefundIcon,
    TruckIcon,
} from '@heroicons/react/24/outline'
import {
    Badge,
    Button,
    Card,
    Flex,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from '@tremor/react'
import Waveform from '@uiball/loaders/dist/components/Waveform'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const LazyCreateChallan = dynamic(
    () => import('@/components/store/create-challan'),
    {
        loading: () => (
            <Flex alignItems="center" justifyContent="center">
                <Waveform size={20} color="#3b82f6" />
            </Flex>
        ),
    },
)
const LazyRewashChallan = dynamic(
    () => import('@/components/store/rewash-challan'),
    {
        loading: () => (
            <Flex alignItems="center" justifyContent="center">
                <Waveform size={20} color="#3b82f6" />
            </Flex>
        ),
    },
)

const ShowChallans = () => {
    const axios = useAxios()
    const { data } = useSession()

    const user = data?.user as UserData

    const [theIndex, setTheIndex] = useState<number>()
    const [challans, setChallans] = useState<DeliveryChallansResponse>()

    useEffect(() => {
        const fetchData = async () => {
            const challansResponse = await axios.get<DeliveryChallansResponse>(
                '/stores/' + user.store_id + '/challans',
                {
                    params: {
                        include: ['factory', 'store'],
                    },
                },
            )

            setChallans(challansResponse.data)
        }

        fetchData()
    }, [])

    return (
        <div className="p-12">
            <Title>Delivery challans</Title>
            <Text>
                Creating delivery challans help you to track with factories
            </Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Card>
                    <Title>Delivery challans</Title>
                    <Text>All delivery challans for your store</Text>
                    <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                        <TabList>
                            <Tab icon={TruckIcon}>List challans</Tab>
                            <Tab icon={PlusCircleIcon}>Create challans</Tab>
                            <Tab icon={ReceiptRefundIcon}>DC for rewash</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel className="mt-4">
                                {challans == undefined ? (
                                    <TableSkeleton numCols={5} numRows={5} />
                                ) : (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableHeaderCell>
                                                    Code
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Factory
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Created on
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Store
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Action
                                                </TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {challans?.data.map((challan) => (
                                                <TableRow key={challan.id}>
                                                    <TableCell>
                                                        {challan.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Flex
                                                            justifyContent="start"
                                                            className="gap-2"
                                                        >
                                                            {
                                                                challan.factory
                                                                    ?.name
                                                            }
                                                            <Badge
                                                                icon={
                                                                    BeakerIcon
                                                                }
                                                            >
                                                                {
                                                                    challan
                                                                        .factory
                                                                        ?.code
                                                                }
                                                            </Badge>
                                                        </Flex>
                                                    </TableCell>
                                                    <TableCell>
                                                        {dayjs(
                                                            challan.created_at,
                                                        ).format('DD, MMMM YY')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Flex
                                                            justifyContent="start"
                                                            className="gap-2"
                                                        >
                                                            {
                                                                challan.store
                                                                    ?.name
                                                            }
                                                            <Badge
                                                                icon={
                                                                    BuildingStorefrontIcon
                                                                }
                                                            >
                                                                {
                                                                    challan
                                                                        .store
                                                                        ?.code
                                                                }
                                                            </Badge>
                                                        </Flex>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={
                                                                '/operator/challans/' +
                                                                challan.id
                                                            }
                                                        >
                                                            <Button
                                                                variant="secondary"
                                                                color="gray"
                                                                icon={TruckIcon}
                                                            >
                                                                Show challan
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabPanel>

                            <TabPanel>
                                {theIndex == 1 && <LazyCreateChallan />}
                            </TabPanel>

                            <TabPanel>
                                {theIndex == 2 && <LazyRewashChallan />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
    )
}

export default isUser(ShowChallans, ['operator'])
