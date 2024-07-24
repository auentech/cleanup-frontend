import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import { StoresResponse, UserData } from '@/common/types'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import {
    Button,
    Callout,
    Card,
    Flex,
    Italic,
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
import { Waveform } from '@uiball/loaders'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import AdminNavigation from '@/components/admin/admin-navigation'
import TableSkeleton from '@/components/table-skeleton'
import { useQuery } from '@tanstack/react-query'

const LazyCreateStore = dynamic(
    () => import('@/components/admin/create-store'),
    {
        loading: () => (
            <Flex alignItems="center" justifyContent="center">
                <Waveform size={20} color="#3b82f6" />
            </Flex>
        ),
    },
)

const StoreIndex = () => {
    const { data } = useSession()
    const axios = useAxios()

    const user = data?.user as UserData
    const [theIndex, setTheIndex] = useState<number>(0)
    const {
        isError,
        isLoading,
        data: stores,
    } = useQuery({
        queryKey: ['stores'],
        queryFn: ({ signal }) =>
            axios.get<StoresResponse>(
                '/stores?include=profile,profile.state,profile.district',
                { signal }
            ),
    })

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Admin dashboard for Cleanup{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <AdminNavigation />

            <Card className="mt-6" decoration="top">
                <Title>Stores</Title>
                <Text>Time to do some magic with these stores</Text>
                <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                    <TabList>
                        <Tab>List Stores</Tab>
                        <Tab>Create Store</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="mt-4">
                                {isError && (
                                    <Callout
                                        color="red"
                                        title="Oops, something went wrong"
                                    >
                                        Unable to load list of stores. Please
                                        reload.
                                    </Callout>
                                )}
                                {isLoading ? (
                                    <TableSkeleton numCols={7} numRows={5} />
                                ) : (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableHeaderCell>
                                                    Store Code
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Name
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Address
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Pincode
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    State
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    District
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Action
                                                </TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stores?.data.data.map((store) => (
                                                <TableRow key={store.id}>
                                                    <TableCell>
                                                        {store.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        {store.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            store?.profile
                                                                ?.address
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            store?.profile
                                                                ?.pincode
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            store?.profile
                                                                ?.state.name
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            store?.profile
                                                                ?.district.name
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={
                                                                '/admin/stores/' +
                                                                store.id
                                                            }
                                                        >
                                                            <Button
                                                                icon={
                                                                    BuildingStorefrontIcon
                                                                }
                                                                size="xs"
                                                                variant="secondary"
                                                                color="gray"
                                                            >
                                                                Show store
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {theIndex == 1 && <LazyCreateStore />}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
        </div>
    )
}

export default isUser(StoreIndex, ['admin'])
