import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import {
    BackendGeneralResponse,
    OrderGarment,
    ServiceResponse,
} from '@/common/types'
import AdminNavigation from '@/components/admin/admin-navigation'
import TableSkeleton from '@/components/table-skeleton'
import { PencilIcon } from '@heroicons/react/24/solid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Button,
    Callout,
    Card,
    Divider,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TextInput,
    Title,
    Text,
    NumberInput,
} from '@tremor/react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
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

type GarmentsRouterQuery = {
    service: string
} & ParsedUrlQuery

const Garments = () => {
    const axios = useAxios()
    const router = useRouter()
    const queryClient = useQueryClient()
    const addGarmentModal = useDisclosure()
    const editGarmentModal = useDisclosure()

    const { service: serviceID } = router.query as GarmentsRouterQuery
    const { isLoading, isError, data } = useQuery({
        queryKey: ['services', serviceID],
        queryFn: () =>
            axios.get<ServiceResponse>(`/services/${serviceID}`, {
                params: {
                    include: 'garments',
                },
            }),
    })

    const [garmentID, setGarmentID] = useState<number>(0)
    const [garmentName, setGarmentName] = useState<string>('')
    const [garmentPrice, setGarmentPrice] = useState<number>(0)

    const addGarmentMutation = useMutation({
        mutationFn: () =>
            axios.post<BackendGeneralResponse>(
                `/services/${serviceID}/garment`,
                {
                    name: garmentName,
                    price: garmentPrice,
                },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', serviceID] })
            queryClient.invalidateQueries({ queryKey: ['services'] })

            toast.success(`Added ${garmentName} garment successfully`)
        },
        onError: () => {
            toast.error(`Unable to add ${garmentName}`)
        },
        onSettled: () => {
            addGarmentModal.onClose()
            setGarmentName('')
            setGarmentPrice(0)
        },
    })

    const editGarmentMutation = useMutation({
        mutationFn: () =>
            axios.patch<BackendGeneralResponse>(
                `/services/${serviceID}/garment/${garmentID}`,
                {
                    name: garmentName,
                    price: garmentPrice,
                },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', serviceID] })
            toast.success(`${garmentName} garment successfully updated`)
        },
        onError: () => {
            toast.error(`Unable to update ${garmentName}`)
        },
        onSettled: () => {
            editGarmentModal.onClose()
            setGarmentID(0)
            setGarmentName('')
            setGarmentPrice(0)
        },
    })

    const updateGarment = (garment: OrderGarment) => {
        setGarmentID(garment.id)
        setGarmentName(garment.name)
        setGarmentPrice(garment.price_max)

        editGarmentModal.onOpen()
    }

    return (
        <div className="p-12">
            <Modal
                isOpen={addGarmentModal.isOpen}
                onOpenChange={addGarmentModal.onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Create garment for {data?.data.data.service}
                            </ModalHeader>
                            <ModalBody>
                                <Text>Garment Name</Text>
                                <TextInput
                                    value={garmentName}
                                    onInput={(e) =>
                                        setGarmentName(e.currentTarget.value)
                                    }
                                />
                                <Text>Garment Price</Text>
                                <NumberInput
                                    value={garmentPrice}
                                    enableStepper={false}
                                    onValueChange={setGarmentPrice}
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
                                    onClick={() => addGarmentMutation.mutate()}
                                >
                                    Submit
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal
                isOpen={editGarmentModal.isOpen}
                onOpenChange={editGarmentModal.onOpenChange}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        Edit garment for {data?.data.data.service}
                    </ModalHeader>
                    <ModalBody>
                        <Text>Garment Name</Text>
                        <TextInput
                            value={garmentName}
                            onInput={(e) =>
                                setGarmentName(e.currentTarget.value)
                            }
                        />
                        <Text>Garment Price</Text>
                        <NumberInput
                            value={garmentPrice}
                            enableStepper={false}
                            onValueChange={setGarmentPrice}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="red"
                            variant="light"
                            onClick={editGarmentModal.onClose}
                        >
                            Close
                        </Button>
                        <Button
                            color="blue"
                            variant="secondary"
                            onClick={() => editGarmentMutation.mutate()}
                        >
                            Edit
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Title>Garments</Title>
            <Subtitle>All garments from service</Subtitle>

            <AdminNavigation />

            <Card className="mt-6">
                <Button
                    className="w-full"
                    variant="secondary"
                    disabled={isLoading}
                    loading={isLoading}
                    loadingText="Loading service information..."
                    onClick={addGarmentModal.onOpen}
                >
                    Add Garments to {data?.data.data.service}
                </Button>

                <Divider />

                {isError && (
                    <Callout title="Something went wrong" color="red">
                        Unable to load garments, please reload
                    </Callout>
                )}

                {isLoading ? (
                    <TableSkeleton numCols={5} numRows={10} />
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>#</TableHeaderCell>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Price</TableHeaderCell>
                                <TableHeaderCell>Created at</TableHeaderCell>
                                <TableHeaderCell>Action</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data.data.garments?.map((garment, index) => (
                                <TableRow key={garment.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{garment.name}</TableCell>
                                    <TableCell>{garment.price_max}</TableCell>
                                    <TableCell>
                                        {dayjs(garment.created_at).format(
                                            'DD, MMMM YYYY',
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="xs"
                                            variant="secondary"
                                            icon={PencilIcon}
                                            onClick={() =>
                                                updateGarment(garment)
                                            }
                                        >
                                            Edit Garment
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    )
}

export default isUser(Garments, ['admin'])
