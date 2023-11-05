import useAxios from "@/common/axios"
import Logout from "@/common/logout"
import isUser from "@/common/middlewares/isUser"
import { BackendGeneralResponse, UserData, UsersResponse } from "@/common/types"
import { Title, Italic, Text, Card, TabGroup, TabList, Tab, TabPanels, TabPanel, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge, Flex, Button, NumberInput, TextInput } from "@tremor/react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Waveform } from "@uiball/loaders"
import dynamic from "next/dynamic"
import ManagerNavigation from "@/components/manager/manager-navigation"
import { DocumentCheckIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/router"
import TableSkeleton from "@/components/table-skeleton"

const LazyCreateWorker = dynamic(() => import('@/components/admin/create-worker'), {
    loading: () => (
        <Flex alignItems="center" justifyContent="center">
            <Waveform
                size={20}
                color="#3b82f6"
            />
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

    const editWorker = (workerData: UserData) => {
        setWorker(workerData)
        onOpen()
    }

    const disableUser = async (theUser: UserData) => {
        const disableUserResponse = await axios.delete<BackendGeneralResponse>('/user/' + theUser.id)

        alert(disableUserResponse.data.message)
        router.reload()
    }

    useEffect(() => {
        (async () => {
            const response = await axios.get<UsersResponse>('/workers', {
                params: {
                    include: ['profile.state', 'profile.district']
                }
            })

            setWorkers(response.data)
        })()
    }, [])

    return (
        <div className="p-12">
            <Title>Welcome, {user.name}</Title>
            <Text>
                Manager dashboard for Cleanup {' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <ManagerNavigation />

            <Card decoration="top" className="mt-6">
                <Title>Workers</Title>
                <Text>All workers in your company</Text>

                <TabGroup className="mt-4" onIndexChange={setTheIndex}>
                    <TabList>
                        <Tab>List workers</Tab>
                        <Tab>Create workers</Tab>
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
                                                <TableHeaderCell>Name</TableHeaderCell>
                                                <TableHeaderCell>Role</TableHeaderCell>
                                                <TableHeaderCell>Email</TableHeaderCell>
                                                <TableHeaderCell>Phone</TableHeaderCell>
                                                <TableHeaderCell>State</TableHeaderCell>
                                                <TableHeaderCell>Action</TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {workers.data.map(worker => (
                                                <TableRow key={worker.id}>
                                                    <TableCell>{worker.name}</TableCell>
                                                    <TableCell>
                                                        <Badge style={{ textTransform: 'capitalize' }}>
                                                            {worker.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{worker.email}</TableCell>
                                                    <TableCell>{worker.phone}</TableCell>
                                                    <TableCell>{worker?.profile?.state.name}</TableCell>
                                                    <TableCell>
                                                        <Button icon={UserIcon} variant="secondary" color="gray" onClick={_ => editWorker(worker)}>
                                                            Show worker
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
                    </TabPanels>
                </TabGroup>
            </Card>

            <Modal backdrop="blur" scrollBehavior="inside" size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <ModalHeader>
                        <Title>Edit user</Title>
                    </ModalHeader>
                    <ModalBody>
                        <div className="pb-4">
                            <div className="mt-4">
                                <Text>Worker name</Text>
                                <TextInput
                                    className="mt-2"
                                    value={worker?.name}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>Worker email</Text>
                                <TextInput
                                    type="email"
                                    className="mt-2"
                                    value={worker?.email}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>Worker phone</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.phone}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>Worker address</Text>
                                <TextInput
                                    className="mt-2"
                                    value={worker?.profile?.address}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>Worker pincode</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.profile?.pincode}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>Worker aadhaar</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.profile?.aadhaar}
                                />
                            </div>

                            <div className="mt-4">
                                <Text>Worker emergency contact</Text>
                                <NumberInput
                                    className="mt-2"
                                    enableStepper={false}
                                    value={worker?.profile?.emergency_contact}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="red" variant="secondary" icon={XMarkIcon} onClick={_ => disableUser(worker as UserData)}>Disable user</Button>
                        <Button color="blue" variant="primary" icon={DocumentCheckIcon}>Save changes</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    )
}

export default isUser(Workers, ['manager'])
