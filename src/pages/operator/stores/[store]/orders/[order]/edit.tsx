import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import {
    BackendGeneralResponse,
    OrderResponse,
    PaymentMode,
    ServicesResponse,
} from '@/common/types'
import {
    ArrowLeftIcon,
    PlusCircleIcon,
    ReceiptPercentIcon,
    TrashIcon,
} from '@heroicons/react/24/outline'
import { ShoppingCartIcon } from '@heroicons/react/24/solid'
import {
    Badge,
    Text,
    Button,
    Card,
    Col,
    Flex,
    Grid,
    Icon,
    NumberInput,
    SearchSelect,
    SearchSelectItem,
    Subtitle,
    Title,
    Divider,
    List,
    ListItem,
    Select,
    SelectItem,
} from '@tremor/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import { Waveform } from '@uiball/loaders'
import { isAxiosError, AxiosError } from 'axios'

type OrderEntry = {
    service: number
    garment: number
    count: number
}

type LocalOrders = {
    service_id: number
    garment_id: number
    count: number
}

const EditOrder = () => {
    const axios = useAxios()
    const router = useRouter()

    const storeID = router.query.store
    const orderID = router.query.order

    const [speed, setSpeed] = useState<number>(0)
    const [order, setOrder] = useState<OrderResponse>()
    const [services, setServices] = useState<ServicesResponse>()
    const [renderer, setRenderer] = useState<OrderEntry[]>([
        { service: 0, garment: 0, count: 0 },
    ])
    const [cost, setCost] = useState<number>(0)
    const [ogCost, setOGCost] = useState<number>(0)
    const [discount, setDiscount] = useState<number>(0)
    const [taxedCost, setTaxedCost] = useState<number>(0)
    const [mode, setMode] = useState<PaymentMode>('Cash')
    const [loading, setLoading] = useState<boolean>(false)
    const [dataLoading, setDataLoading] = useState<boolean>(false)
    const [thePackage, setThePackage] = useState<string>('executive')
    const [installment, setInstallment] = useState<'full' | 'half' | 'nil'>()

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true)
            const orderResponse = await axios.get<OrderResponse>(
                '/stores/' + storeID + '/orders/' + orderID,
                {
                    params: {
                        include: [
                            'customer.profile.state',
                            'customer.profile.district',
                            'orderItems.garment',
                            'orderItems.service',
                        ],
                    },
                },
            )

            const servicesResponse = await axios.get<ServicesResponse>(
                '/services',
                {
                    params: {
                        include: ['garments'],
                    },
                },
            )

            setServices(servicesResponse.data)
            setOrder(orderResponse.data)

            const groupedOrders = groupBy(
                orderResponse.data?.data.items,
                (item) => `${item.garment.id}-${item.service.id}`,
            )
            const oldOrder = map(groupedOrders, (gOrder) => {
                return {
                    service: gOrder[0].service.id,
                    garment: gOrder[0].garment.id,
                    count: gOrder.length,
                }
            })

            setRenderer(oldOrder as OrderEntry[])
            setDataLoading(false)
        }

        fetchData()
    }, [])

    useEffect(() => {
        let updatedCost = ogCost

        switch (speed) {
            case 1:
                updatedCost *= 2
                break
            case 2:
                updatedCost *= 1.5
                break
            case 3:
                updatedCost *= 1.25
                break
            default:
                break
        }

        switch (thePackage) {
            case 'executive':
                // Do nothing, cost remains the same
                break
            case 'economy':
                updatedCost -= updatedCost * 0.15
                break
            default:
                break
        }

        setCost(updatedCost - (discount / 100) * updatedCost)
    }, [speed, thePackage, renderer, discount])

    useEffect(() => {
        const tax = cost * (18 / 100)
        setTaxedCost(cost + tax)
    }, [cost])

    useEffect(() => {
        let newCost = 0

        renderer.forEach((render) => {
            const service = services?.data.find(
                (service) => service.id == render.service,
            )
            const garment = service?.garments?.find(
                (garment) => garment.id == render.garment,
            )

            if (
                service == undefined ||
                garment == undefined ||
                render.count == 0 ||
                Number.isNaN(render.count)
            ) {
                return
            }

            newCost += (garment?.price_max as number) * render.count
        })

        setCost(newCost)
        setOGCost(newCost)
    }, [renderer])

    const handleDiscountChange = (value: number) => {
        if (isNaN(value) || value <= 0) {
            setDiscount(0)
            return
        }

        setDiscount(value)
    }

    const renderGarments = (serviceID: number) => {
        const service = services?.data.find(
            (service) => service.id == serviceID,
        )

        return service?.garments?.map((garment) => (
            <SearchSelectItem key={garment.id} value={garment.id + ''}>
                {garment.name} - {garment.price_max} ₹
            </SearchSelectItem>
        ))
    }

    const addOrder = () => {
        setRenderer((oldRenders) => [
            ...oldRenders,
            { service: 0, garment: 0, count: 0 },
        ])
    }

    const deleteOrder = (index: number) => {
        if (renderer.length <= 1) {
            return
        }

        const updatedRenderer = renderer.filter((_, i) => index != i)
        setRenderer(updatedRenderer)
    }

    const updateService = (index: number, serviceID: number) => {
        const updatedRenderer = [...renderer]
        updatedRenderer[index].service = serviceID
        setRenderer(updatedRenderer)
    }

    const updateGarment = (index: number, garmentID: number) => {
        const updatedRenderer = [...renderer]
        updatedRenderer[index].garment = garmentID
        setRenderer(updatedRenderer)
    }

    const updateCount = (index: number, count: number) => {
        const updatedRenderer = [...renderer]
        updatedRenderer[index].count = count
        setRenderer(updatedRenderer)
    }

    const handleOrderCreate = async () => {
        setLoading(true)

        let orders: LocalOrders[] = renderer.map((render) => ({
            service_id: render.service,
            garment_id: render.garment,
            count: render.count,
        }))

        try {
            const orderCreated = await axios.put<BackendGeneralResponse>(
                '/stores/' + storeID + '/orders/' + order?.data.code,
                {
                    cost,
                    mode,
                    speed,
                    orders,
                    discount,
                    installment,
                    package: thePackage,
                },
            )

            alert(orderCreated.data.message)
            router.push(`/operator/stores/${storeID}/orders/${orderID}`)
        } catch (e) {
            if (isAxiosError(e)) {
                const err = e as AxiosError
                const data = err.response?.data as BackendGeneralResponse

                alert(data.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const getInstallment = (): number => {
        switch (installment) {
            case 'full':
                return taxedCost
            case 'half':
                return taxedCost / 2
            default:
                return 0
        }
    }

    return (
        <>
            {dataLoading ? (
                <div className="p-12">
                    <Card className="h-60">
                        <Flex alignItems="center" justifyContent="center">
                            <Waveform size={20} color="#3b82f6" />
                        </Flex>
                    </Card>
                </div>
            ) : (
                <div className="p-12">
                    <div>
                        <Flex justifyContent="start">
                            <Icon
                                icon={ArrowLeftIcon}
                                onClick={() => router.back()}
                                style={{ cursor: 'pointer' }}
                            ></Icon>
                            <Title>Editing order</Title>
                            <Badge
                                icon={ShoppingCartIcon}
                                size="xs"
                                className="ml-4"
                            >
                                {order?.data.code}
                            </Badge>
                        </Flex>
                    </div>

                    <Card className="mt-4">
                        <Title>Order Items</Title>
                        {renderer.map((render, key) => (
                            <div className="mt-4" key={key}>
                                <Grid numItemsMd={12} className="gap-6">
                                    <Col numColSpan={5}>
                                        <Text>Service</Text>
                                        <SearchSelect
                                            className="mt-2"
                                            onValueChange={(v) =>
                                                updateService(key, parseInt(v))
                                            }
                                            value={render.service + ''}
                                            enableClear={false}
                                        >
                                            {services?.data.map((service) => (
                                                <SearchSelectItem
                                                    key={service.id}
                                                    value={service.id + ''}
                                                >
                                                    {service.service}
                                                </SearchSelectItem>
                                            )) || (
                                                <SearchSelectItem value="">
                                                    Loading...
                                                </SearchSelectItem>
                                            )}
                                        </SearchSelect>
                                    </Col>
                                    <Col numColSpan={5}>
                                        <Text>Garment</Text>
                                        <SearchSelect
                                            className="mt-2"
                                            onValueChange={(v) =>
                                                updateGarment(key, parseInt(v))
                                            }
                                            value={render.garment + ''}
                                            enableClear={false}
                                        >
                                            {render.service == 0 ? (
                                                <SearchSelectItem value="">
                                                    Select service
                                                </SearchSelectItem>
                                            ) : (
                                                (renderGarments(
                                                    renderer[key].service,
                                                ) as JSX.Element[])
                                            )}
                                        </SearchSelect>
                                    </Col>
                                    <Col numColSpan={1}>
                                        <Text>Count</Text>
                                        <NumberInput
                                            min={1}
                                            onValueChange={(v) =>
                                                updateCount(key, v)
                                            }
                                            value={render.count}
                                            enableStepper={false}
                                            className="mt-2 min-w-full"
                                        />
                                    </Col>
                                    <Col numColSpan={1}>
                                        <Text>Action</Text>
                                        <Button
                                            className="mt-2 w-full"
                                            icon={TrashIcon}
                                            variant="secondary"
                                            color="red"
                                            onClick={(_) => deleteOrder(key)}
                                            disabled={renderer.length <= 1}
                                        />
                                    </Col>
                                </Grid>
                            </div>
                        ))}

                        <Divider />

                        <Button
                            variant="secondary"
                            className="w-full"
                            icon={PlusCircleIcon}
                            onClick={addOrder}
                        >
                            Add service
                        </Button>

                        <Divider />

                        <div className="mt-4">
                            <Text>Discount</Text>
                            <NumberInput
                                icon={ReceiptPercentIcon}
                                enableStepper={false}
                                value={discount}
                                onValueChange={handleDiscountChange}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <Text>Delivery speed</Text>
                            <Select
                                value={speed + ''}
                                onValueChange={(v) => setSpeed(parseInt(v))}
                                enableClear={false}
                                className="mt-2"
                            >
                                <SelectItem value="1">
                                    1 Day delivery
                                </SelectItem>
                                <SelectItem value="2">
                                    2 Day delivery
                                </SelectItem>
                                <SelectItem value="3">
                                    3 Day delivery
                                </SelectItem>
                                <SelectItem value="0">
                                    General delivery
                                </SelectItem>
                            </Select>
                        </div>

                        <div className="mt-4">
                            <Text>Package</Text>
                            <Select
                                value={thePackage}
                                onValueChange={setThePackage}
                                enableClear={false}
                                className="mt-2"
                            >
                                <SelectItem value="executive">
                                    Executive package
                                </SelectItem>
                                <SelectItem value="economy">
                                    Economy package
                                </SelectItem>
                            </Select>
                        </div>

                        <List className="mt-4">
                            <ListItem>
                                <Title>Order Gross Total</Title>
                                <Title>₹ {ogCost.toFixed(2)}</Title>
                            </ListItem>
                            <ListItem>
                                <Title>Discount given</Title>
                                <Title>% {discount}</Title>
                            </ListItem>
                            <ListItem>
                                <Title>Discounted total</Title>
                                <Title>₹ {cost.toFixed(2)}</Title>
                            </ListItem>
                            <ListItem>
                                <Title>CGST</Title>
                                <Title>₹ {(cost * (9 / 100)).toFixed(2)}</Title>
                            </ListItem>
                            <ListItem>
                                <Title>SGST</Title>
                                <Title>₹ {(cost * (9 / 100)).toFixed(2)}</Title>
                            </ListItem>
                            <ListItem>
                                <Title>Order Net Total</Title>
                                <Title>₹ {taxedCost.toFixed(2)}</Title>
                            </ListItem>
                            <ListItem>
                                <Flex
                                    justifyContent="between"
                                    className="gap-6"
                                >
                                    <Title>First installment</Title>
                                    <div>
                                        <Button
                                            color={
                                                installment == 'half'
                                                    ? 'blue'
                                                    : 'gray'
                                            }
                                            onClick={(e) =>
                                                setInstallment('half')
                                            }
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            Half
                                        </Button>
                                        <Button
                                            color={
                                                installment == 'full'
                                                    ? 'blue'
                                                    : 'gray'
                                            }
                                            onClick={(e) =>
                                                setInstallment('full')
                                            }
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            Full
                                        </Button>
                                        <Button
                                            color={
                                                installment == 'nil'
                                                    ? 'blue'
                                                    : 'gray'
                                            }
                                            onClick={(e) =>
                                                setInstallment('nil')
                                            }
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            None
                                        </Button>
                                    </div>
                                </Flex>
                            </ListItem>
                            {installment != undefined && (
                                <ListItem>
                                    <Title>To pay now</Title>
                                    <Title>
                                        ₹ {getInstallment().toFixed(2)}
                                    </Title>
                                </ListItem>
                            )}
                        </List>

                        <div className="py-2">
                            <Title>Payment mode</Title>
                            <Select
                                value={mode}
                                onValueChange={(v) => setMode(v as PaymentMode)}
                                enableClear={false}
                                className="mt-2"
                            >
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                            </Select>
                        </div>

                        <Flex justifyContent="end" className="mt-4 gap-6">
                            <Button
                                icon={ShoppingCartIcon}
                                loading={loading}
                                disabled={installment == undefined}
                                loadingText="Creating order..."
                                onClick={handleOrderCreate}
                            >
                                Edit order
                            </Button>
                        </Flex>
                    </Card>
                </div>
            )}
        </>
    )
}

export default isUser(EditOrder, ['operator'])
