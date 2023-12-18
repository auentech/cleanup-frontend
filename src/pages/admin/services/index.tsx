import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { ServicesResponse } from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import TableSkeleton from '@/components/table-skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Button,
    Callout,
    Card,
    Divider,
    Text,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TextInput,
    Title,
} from '@tremor/react'
import dayjs from 'dayjs'
import Link from 'next/link'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from '@nextui-org/modal'
import { useState } from 'react'
import { toast } from 'react-toastify'

const Services = () => {
    const axios = useAxios()
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    const { isLoading, isError, data } = useQuery({
        queryKey: ['services'],
        queryFn: () =>
            axios.get<ServicesResponse>('/services', {
                params: {
                    include: 'garmentsCount',
                },
            }),
    })

    const [serviceName, setServiceName] = useState<string>('')
    const mutation = useMutation({
        mutationFn: () =>
            axios.post('/services/service', {
                name: serviceName,
            }),
        onSuccess: () => {
            toast.success(`${serviceName} service added successfully`)
            queryClient.invalidateQueries({ queryKey: ['services'] })
        },
        onError: () => {
            toast.error(`Unable to add ${serviceName} service`)
        },
        onSettled: () => {
            onClose()
            setServiceName('')
        },
    })

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create service
                            </ModalHeader>
                            <ModalBody>
                                <Text>Service name</Text>
                                <TextInput
                                    value={serviceName}
                                    onInput={(e) =>
                                        setServiceName(e.currentTarget.value)
                                    }
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="red"
                                    variant="light"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    color="blue"
                                    variant="secondary"
                                    onClick={() => mutation.mutate()}
                                >
                                    Submit
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <div className="p-12">
                <Title>Services</Title>
                <Subtitle>All services available in your business</Subtitle>

                <AdminNavigation />

                <Card className="mt-6">
                    {isError && (
                        <Callout color="red" title="Something went wrong">
                            Unable to load services, please reload
                        </Callout>
                    )}

                    <div>
                        {isLoading ? (
                            <TableSkeleton numRows={10} numCols={4} />
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>ID</TableHeaderCell>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>
                                            Garments
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Created on
                                        </TableHeaderCell>
                                        <TableHeaderCell>
                                            Action
                                        </TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.data.data.map((service, item) => (
                                        <TableRow key={service.id}>
                                            <TableCell>{item + 1}</TableCell>
                                            <TableCell>
                                                {service.service}
                                            </TableCell>
                                            <TableCell>
                                                {service.garments_count}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(
                                                    service.created_at,
                                                ).format('DD, MMMM YY')}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/services/${service.id}/garments`}
                                                >
                                                    <Button
                                                        size="xs"
                                                        variant="secondary"
                                                    >
                                                        View Garments
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <Divider />

                    <Button
                        className="w-full"
                        variant="secondary"
                        onClick={onOpen}
                    >
                        Add service
                    </Button>
                </Card>
            </div>
        </>
    )
}

export default isUser(Services, ['admin'])
