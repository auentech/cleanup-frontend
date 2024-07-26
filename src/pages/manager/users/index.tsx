import useAxios from '@/common/axios'
import Logout from '@/common/logout'
import isUser from '@/common/middlewares/isUser'
import { BackendGeneralResponse, UserData, UsersResponse } from '@/common/types'
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
import { useState } from 'react'
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
    Pagination,
    useDisclosure,
} from '@nextui-org/react'
import { useRouter } from 'next/router'
import TableSkeleton from '@/components/table-skeleton'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ManagerNavigation from '@/components/manager/manager-navigation'

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

const UpdateWorkerSchema = z.object({
    name: z.string().min(5),
    email: z.string().email(),
    phone: z.number(),
    profile: z.object({
        address: z.string(),
        pincode: z.number(),
        aadhaar: z.number(),
        emergency_contact: z.number(),
    })
})
type UpdateWorker = z.infer<typeof UpdateWorkerSchema>

const Workers = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()
    const user = data?.user as UserData

    const [workerPage, setWorkerPage] = useState<number>(1)
    const [theIndex, setTheIndex] = useState<number>(0)
    const [worker, setWorker] = useState<UserData>()

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

    const showWorker = (workerData: UserData) => {
        setWorker(workerData)
        onOpen()
    }

    const { data: workers, isFetching: workersLoading } = useQuery({
        queryKey: ['workers', workerPage],
        queryFn: ({ signal }) => axios.get<UsersResponse>('/workers', {
            signal,
            params: {
                page: workerPage,
                include: ['profile.state', 'profile.district'],
            },
        }),
        select: data => data.data,
        placeholderData: keepPreviousData,
    })

    const { register, reset, handleSubmit, control, formState: { errors } } = useForm<UpdateWorker>({
        values: {
            name: worker?.name!,
            email: worker?.email!,
            phone: worker?.phone!,
            profile: {
                address: worker?.profile?.address!,
                aadhaar: worker?.profile?.aadhaar!,
                pincode: worker?.profile?.pincode!,
                emergency_contact: worker?.profile?.emergency_contact!,
            }
        },
        resolver: zodResolver(UpdateWorkerSchema),
    })

    const disableWorkerMutation = useMutation({
        mutationFn: (data: UserData) => axios.delete<BackendGeneralResponse>('/user/' + data.id)
    })
    const updateWorkerMutation = useMutation({
        mutationFn: (data: UpdateWorker) => axios.put('/workers/' + worker?.id, data)
    })

    const updateWorker: SubmitHandler<UpdateWorker> = data => updateWorkerMutation.mutate(data, {
        onSuccess: () => {
            reset()
            onClose()
            alert('Worker updated successfully')
        }
    })

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Manager dashboard for Cleanup{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <ManagerNavigation />

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
                                {workersLoading ? (
                                    <TableSkeleton numCols={6} numRows={30} />
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
                                            {workers?.data.map((worker) => (
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

                                {workers?.meta.last_page! > 1 && (
                                    <Pagination
                                        total={workers?.meta.last_page!}
                                        page={workerPage}
                                        onChange={setWorkerPage}
                                    />
                                )}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {theIndex == 1 && <LazyCreateWorker />}
                        </TabPanel>
                        <TabPanel>
                            {theIndex == 2 && <LazyListCustomers role='manager' />}
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
                    <form onSubmit={handleSubmit(updateWorker)}>
                        <ModalHeader>
                            <Title>Edit user</Title>
                        </ModalHeader>
                        <ModalBody>
                            <div className="pb-4">
                                <div className="mt-4">
                                    <Text>User name</Text>
                                    <TextInput
                                        className="mt-2"
                                        {...register('name')}
                                        disabled={updateWorkerMutation.isPending}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Text>User email</Text>
                                    <TextInput
                                        type="email"
                                        className="mt-2"
                                        {...register('email')}
                                        disabled={updateWorkerMutation.isPending}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Text>User phone</Text>
                                    <Controller
                                        control={control}
                                        name='phone'
                                        render={({ field }) => (
                                            <NumberInput
                                                {...field}
                                                className="mt-2"
                                                enableStepper={false}
                                                disabled={updateWorkerMutation.isPending}
                                                onChange={v => { }}
                                                onValueChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Text>User address</Text>
                                    <TextInput
                                        className="mt-2"
                                        {...register('profile.address')}
                                        disabled={updateWorkerMutation.isPending}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Text>User pincode</Text>
                                    <Controller
                                        control={control}
                                        name='profile.pincode'
                                        render={({ field }) => (
                                            <NumberInput
                                                {...field}
                                                className="mt-2"
                                                enableStepper={false}
                                                disabled={updateWorkerMutation.isPending}
                                                onChange={v => { }}
                                                onValueChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Text>User aadhaar</Text>
                                    <Controller
                                        control={control}
                                        name='profile.aadhaar'
                                        render={({ field }) => (
                                            <NumberInput
                                                {...field}
                                                className="mt-2"
                                                enableStepper={false}
                                                disabled={updateWorkerMutation.isPending}
                                                onChange={v => { }}
                                                onValueChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Text>User emergency contact</Text>
                                    <Controller
                                        control={control}
                                        name='profile.emergency_contact'
                                        render={({ field }) => (
                                            <NumberInput
                                                {...field}
                                                className="mt-2"
                                                enableStepper={false}
                                                disabled={updateWorkerMutation.isPending}
                                                onChange={v => { }}
                                                onValueChange={field.onChange}
                                            />
                                        )}
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
                                            '/manager/users/' + worker.id + '/orders',
                                        )
                                    }
                                >
                                    Show orders
                                </Button>
                            )}
                            <Button
                                color="red"
                                icon={XMarkIcon}
                                variant="secondary"
                                loadingText='Disabling user...'
                                loading={disableWorkerMutation.isPending}
                                onClick={_ => disableWorkerMutation.mutate(worker!, {
                                    onSuccess: () => {
                                        onClose()
                                        alert('Disabled user successfully')
                                    }
                                })}
                            >
                                Disable user
                            </Button>
                            <Button
                                color="blue"
                                type='submit'
                                variant="primary"
                                icon={DocumentCheckIcon}
                                loading={updateWorkerMutation.isPending}
                                loadingText='Updating user...'
                            >
                                Save changes
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default isUser(Workers, ['manager'])
