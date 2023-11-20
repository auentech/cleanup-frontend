import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import { BackendGeneralResponse, UserData, UsersResponse } from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import {
    Title,
    Italic,
    Text,
    Card,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Badge,
    Button,
    Flex,
    NumberInput,
    TextInput,
} from '@tremor/react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
    DocumentCheckIcon,
    UserIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { Waveform } from '@uiball/loaders'
import dynamic from 'next/dynamic'
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from '@nextui-org/react'
import { useRouter } from 'next/router'
import TableSkeleton from '@/components/table-skeleton'

const LazyCreateWorker = dynamic(
    () => import('@/components/admin/create-worker'),
    {
        loading: () => (
            <Flex alignItems="center" justifyContent="center">
                <Waveform size={20} color="#3b82f6" />
            </Flex>
        ),
    },
)

const LazyListCustomers = dynamic(() => import('@/components/admin/list-customers'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform size={20} color="#3b82f6" />
        </Flex>
    )
})

const Workers = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()
    const user = data?.user as UserData

    const [theIndex, setTheIndex] = useState<number>(0)
    const [workers, setWorkers] = useState<UsersResponse>()
    const [worker, setWorker] = useState<UserData>()

    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const showWorker = (workerData: UserData) => {
        setWorker(workerData)
        onOpen()
    }

    const editWorker = async (workerData: UserData) => {
        const workerResponse = await axios.put('/workers/' + workerData.id)
        console.log(workerResponse)
    }

    const disableUser = async (theUser: UserData) => {
        const disableUserResponse = await axios.delete<BackendGeneralResponse>(
            '/user/' + theUser.id,
        )

        alert(disableUserResponse.data.message)
        router.reload()
    }

    useEffect(() => {
        ; (async () => {
            const response = await axios.get<UsersResponse>('/workers', {
                params: {
                    include: ['profile.state', 'profile.district'],
                },
            })

            setWorkers(response.data)
        })()
    }, [])

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

            <Card decoration="top" className="mt-6">
                <Title>Users</Title>
                <Text>All users in your company</Text>

                <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                    <TabList>
                        <Tab>List workers</Tab>
                        <Tab>Create worker</Tab>
                        <Tab>List customers</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="mt-4">
                                {workers == undefined ? (
                                    <TableSkeleton numCols={6} numRows={5} />
                                ) : (
                                    <Table className="mt-4">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeaderCell>
                                                    Name
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Role
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Email
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Phone
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    State
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    Action
                                                </TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {workers.data.map((worker) => (
                                                <TableRow key={worker.id}>
                                                    <TableCell>
                                                        {worker.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            style={{
                                                                textTransform:
                                                                    'capitalize',
                                                            }}
                                                        >
                                                            {worker.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {worker.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {worker.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            worker?.profile
                                                                ?.state.name
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            icon={UserIcon}
                                                            variant="secondary"
                                                            color="gray"
                                                            onClick={(_) =>
                                                                showWorker(
                                                                    worker,
                                                                )
                                                            }
                                                        >
                                                            Show user
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {theIndex == 1 && <LazyCreateWorker />}
                        </TabPanel>
                        <TabPanel>
                            {theIndex == 2 && <LazyListCustomers />}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>

            <Modal
                backdrop="blur"
                scrollBehavior="inside"
                size="2xl"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    <ModalHeader>
                        <Title>Edit user</Title>
                    </ModalHeader>
                    <ModalBody>
                        <div className="pb-4">
                            <div className="mt-4">
                                <Text>User name</Text>
                                <TextInput
                                    className="mt-2"
                                    value={worker?.name}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>User email</Text>
                                <TextInput
                                    type="email"
                                    className="mt-2"
                                    value={worker?.email}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>User phone</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.phone}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>User address</Text>
                                <TextInput
                                    className="mt-2"
                                    value={worker?.profile?.address}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>User pincode</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.profile?.pincode}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>User aadhaar</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.profile?.aadhaar}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>User emergency contact</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.profile?.emergency_contact}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {worker?.role == 'customer' && (
                            <Button
                                variant="secondary"
                                color="gray"
                                onClick={(_) =>
                                    router.push(
                                        '/admin/users/' + worker.id + '/orders',
                                    )
                                }
                            >
                                Show orders
                            </Button>
                        )}
                        <Button
                            color="red"
                            variant="secondary"
                            icon={XMarkIcon}
                            onClick={(_) => disableUser(worker as UserData)}
                        >
                            Disable user
                        </Button>
                        <Button
                            color="blue"
                            variant="primary"
                            icon={DocumentCheckIcon}
                            onClick={_ => editWorker(worker as UserData)}
                        >
                            Save changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default isUser(Workers, ['admin'])
