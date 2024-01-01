import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import { ReturnChallansResponse, UserData } from '@/common/types'
import Loading from '@/components/loading'
import TableSkeleton from '@/components/table-skeleton'
import { CameraIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { Pagination } from '@nextui-org/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
    Subtitle,
    Title,
    Italic,
    Card,
    TabList,
    TabGroup,
    Tab,
    TabPanels,
    TabPanel,
    Table,
    TableHead,
    TableHeaderCell,
    TableRow,
    TableBody,
    TableCell,
    Button,
    Callout,
    Flex,
} from '@tremor/react'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

const LazyCreateReturn = dynamic(() => import('@/components/create-return'), {
    loading: () => <Loading />,
})

const PackerHome = () => {
    const axios = useAxios()
    const { data } = useSession()
    const user = data?.user as UserData

    const [page, setPage] = useState<number>(1)
    const [index, setIndex] = useState<number>(0)

    const {
        isError,
        isLoading,
        data: returnChallans,
    } = useQuery({
        initialData: keepPreviousData,
        queryKey: ['return-challans', page],
        queryFn: () =>
            axios.get<ReturnChallansResponse>(`/return-challans?page=${page}`, {
                params: {
                    include: [
                        'store',
                        'store.profile.state',
                        'store.profile.district',
                    ],
                },
            }),
    })

    const typedReturnChallans = returnChallans as
        | AxiosResponse<ReturnChallansResponse, any>
        | undefined

    return (
        <div className="p-12">
            <Head>
                <title key="title">{user?.name} packer | Cleanup</title>
            </Head>
            <Title>Packer dashboard</Title>
            <Subtitle>
                Packer dashboard for {user?.name}{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Subtitle>

            <div className="mt-4">
                <Card>
                    <Title>Return challans</Title>
                    <Subtitle>Send orders back to the store</Subtitle>

                    <TabGroup className="mt-2" onIndexChange={setIndex}>
                        <TabList>
                            <Tab>List challans</Tab>
                            <Tab>Create challan</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel className="mt-4">
                                {isError && (
                                    <Callout title="Oops, something went wrong!">
                                        Unable to get list of challans, please
                                        reload the page
                                    </Callout>
                                )}

                                {isLoading ? (
                                    <TableSkeleton numCols={6} numRows={5} />
                                ) : (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableHeaderCell>
                                                    RC Code
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Store Code
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Store Name
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Created at
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Order codes
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    QR Codes
                                                </TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {typedReturnChallans?.data.data.map(
                                                (challan) => (
                                                    <TableRow
                                                        key={challan.code}
                                                    >
                                                        <TableCell>
                                                            {challan.code}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                challan.store
                                                                    ?.code
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                challan.store
                                                                    ?.name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {dayjs(
                                                                challan.created_at,
                                                            ).format(
                                                                'DD, MMMM YY',
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="light"
                                                                icon={
                                                                    ShoppingBagIcon
                                                                }
                                                            >
                                                                Show order codes
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Link
                                                                href={
                                                                    process.env
                                                                        .NEXT_PUBLIC_BACKEND_URL +
                                                                    'api/return-challans/' +
                                                                    challan.code +
                                                                    '/qr?token=' +
                                                                    user?.token
                                                                }
                                                                target="_blank"
                                                            >
                                                                <Button
                                                                    variant="secondary"
                                                                    icon={
                                                                        CameraIcon
                                                                    }
                                                                >
                                                                    Show QR
                                                                    codes
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                )}

                                <Flex justifyContent="end">
                                    {!isLoading &&
                                        (typedReturnChallans?.data.meta
                                            .last_page as number) > 1 && (
                                            <Pagination
                                                className="mt-4"
                                                total={
                                                    typedReturnChallans?.data
                                                        .meta
                                                        .last_page as number
                                                }
                                                page={page}
                                                onChange={setPage}
                                            />
                                        )}
                                </Flex>
                            </TabPanel>

                            <TabPanel>
                                {index == 1 && <LazyCreateReturn />}
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>
            </div>
        </div>
    )
}

export default isUser(PackerHome, ['packer'])
