import useAxios from '@/common/axios'
import {
    BackendGeneralResponse,
    PaymentMode,
    ServicesResponse,
    StoreResponse,
    UserData,
    UserSearchResponse,
} from '@/common/types'
import {
    CheckIcon,
    PlusCircleIcon,
    ReceiptPercentIcon,
    ShoppingCartIcon,
    TrashIcon,
    UserIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline'
import {
    Button,
    Callout,
    Col,
    DatePicker,
    DatePickerValue,
    Divider,
    Flex,
    Grid,
    List,
    ListItem,
    NumberInput,
    SearchSelect,
    SearchSelectItem,
    Select,
    SelectItem,
    Text,
    TextInput,
    Title,
} from '@tremor/react'
import { AxiosError, isAxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type LocalOrders = {
    service_id: number
    garment_id: number
    count: number
}

type CreateOrderType = {
    store: StoreResponse
}

type OrderEntry = {
    service: number
    garment: number
    count: number
}

const CreateOrder = ({ store }: CreateOrderType) => {
    const axios = useAxios()
    const router = useRouter()

    const [showCustomerForm, setShowCustomerForm] = useState(false)
    const [customers, setCustomers] = useState<UserSearchResponse>()
    const [customerSearch, setCustomerSearch] = useState<string>()
    const [selectedCustomer, setSelectedCustomer] = useState<UserData>()

    const [speed, setSpeed] = useState<number>(0)
    const [thePackage, setThePackage] = useState<string>('executive')
    const [installment, setInstallment] = useState<'full' | 'half' | 'nil'>()
    const [services, setServices] = useState<ServicesResponse>()
    const [renderer, setRenderer] = useState<OrderEntry[]>([
        { service: 0, garment: 0, count: 0 },
    ])

    const [customerName, setCustomerName] = useState<string>()
    const [customerphone, setCustomerPhone] = useState<number>()
    const [customeremail, setCustomerEmail] = useState<string>()
    const [customeraddress, setCustomerAddress] = useState<string>()
    const [customerpincode, setCustomerPincode] = useState<number>()

    const [cost, setCost] = useState<number>(0)
    const [ogCost, setOGCost] = useState<number>(0)
    const [discount, setDiscount] = useState<number>(0)
    const [mode, setMode] = useState<PaymentMode>('Cash')
    const [taxedCost, setTaxedCost] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [dueDate, setDueDate] = useState<DatePickerValue>()

    useEffect(() => {
        const fetchCustomers = async () => {
            const customersResponse = await axios.get<UserSearchResponse>(
                '/search/customer',
                {
                    params: {
                        search: customerSearch,
                    },
                },
            )

            setCustomers(customersResponse.data)
        }

        fetchCustomers()
    }, [customerSearch])

    useEffect(() => {
        const fetchServices = async () => {
            const servicesResponse =
                await axios.get<ServicesResponse>('/services')
            setServices(servicesResponse.data)
        }

        fetchServices()
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

    const handleOrderCreate = async () => {
        setLoading(true)

        let orders: LocalOrders[] = renderer.map((render) => ({
            service_id: render.service,
            garment_id: render.garment,
            count: render.count,
        }))

        try {
            if (showCustomerForm) {
                let new_customer = {
                    name: customerName as string,
                    email: customeremail as string,
                    address: customeraddress as string,
                    phone: customerphone as number,
                    pincode: customerpincode as number,
                }

                const orderCreated = await axios.post<BackendGeneralResponse>(
                    '/stores/' + store.data.id + '/orders',
                    {
                        cost,
                        mode,
                        speed,
                        orders,
                        discount,
                        installment,
                        new_customer,
                        due_date: dueDate,
                        package: thePackage,
                    },
                )

                alert(orderCreated.data.message)
                router.reload()

                return
            }

            const orderCreated = await axios.post<BackendGeneralResponse>(
                '/stores/' + store.data.id + '/orders',
                {
                    cost,
                    mode,
                    speed,
                    orders,
                    discount,
                    installment,
                    package: thePackage,
                    due_date: dueDate,
                    customer_id: selectedCustomer?.id,
                },
            )

            alert(orderCreated.data.message)
            router.reload()
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
            {selectedCustomer != undefined && (
                <Callout
                    className="mt-4"
                    title="Customer selected"
                    icon={UserIcon}
                >
                    This order is now created for {selectedCustomer.name}
                </Callout>
            )}

            {!showCustomerForm && selectedCustomer == undefined && (
                <>
                    <div className="mt-4">
                        <Text>Search customer</Text>
                        <TextInput
                            placeholder="Search..."
                            className="mt-2"
                            onInput={(e) =>
                                setCustomerSearch(e.currentTarget.value)
                            }
                        />
                    </div>

                    {customers && (
                        <List className="mt-4">
                            <ListItem>
                                <Text>New customer?</Text>
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    color="blue"
                                    icon={UserPlusIcon}
                                    onClick={() => setShowCustomerForm(true)}
                                >
                                    Create customer
                                </Button>
                            </ListItem>
                            {customers.data.map((customer) => (
                                <ListItem key={customer.id}>
                                    <Text>
                                        {customer.name} - {customer.phone} -{' '}
                                        {customer.email}
                                    </Text>
                                    <Button
                                        size="xs"
                                        variant="secondary"
                                        color="gray"
                                        icon={CheckIcon}
                                        onClick={() =>
                                            setSelectedCustomer(customer)
                                        }
                                    >
                                        Select customer
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </>
            )}

            {showCustomerForm && (
                <>
                    <div className="mt-4">
                        <Text>Customer name</Text>
                        <TextInput
                            type="text"
                            className="mt-2"
                            onInput={(e) =>
                                setCustomerName(e.currentTarget.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <Text>Customer phone</Text>
                        <NumberInput
                            className="mt-2"
                            enableStepper={false}
                            onValueChange={setCustomerPhone}
                        />
                    </div>

                    <div className="mt-4">
                        <Text>Customer email</Text>
                        <TextInput
                            type="email"
                            className="mt-2"
                            onInput={(e) =>
                                setCustomerEmail(e.currentTarget.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <Text>Customer address</Text>
                        <TextInput
                            type="email"
                            className="mt-2"
                            onInput={(e) =>
                                setCustomerAddress(e.currentTarget.value)
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <Text>Customer pincode</Text>
                        <NumberInput
                            className="mt-2"
                            enableStepper={false}
                            onValueChange={setCustomerPincode}
                        />
                    </div>
                </>
            )}

            {(selectedCustomer || showCustomerForm) && (
                <>
                    <Divider />

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
                                    <TextInput
                                        onInput={(e) =>
                                            updateCount(
                                                key,
                                                Number(e.currentTarget.value),
                                            )
                                        }
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
                        <TextInput
                            icon={ReceiptPercentIcon}
                            onInput={(e) =>
                                handleDiscountChange(
                                    Number(e.currentTarget.value),
                                )
                            }
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
                            <SelectItem value="1">1 Day delivery</SelectItem>
                            <SelectItem value="2">2 Day delivery</SelectItem>
                            <SelectItem value="3">3 Day delivery</SelectItem>
                            <SelectItem value="0">General delivery</SelectItem>
                        </Select>
                    </div>

                    {speed == 0 && (
                        <div className="mt-4">
                            <Text>Due Date</Text>
                            <DatePicker
                                className="mt-2 w-full"
                                value={dueDate}
                                onValueChange={setDueDate}
                            />
                        </div>
                    )}

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
                            <Flex justifyContent="between" className="gap-6">
                                <Title>First installment</Title>
                                <div>
                                    <Button
                                        color={
                                            installment == 'half'
                                                ? 'blue'
                                                : 'gray'
                                        }
                                        onClick={(e) => setInstallment('half')}
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
                                        onClick={(e) => setInstallment('full')}
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
                                        onClick={(e) => setInstallment('nil')}
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
                                <Title>₹ {getInstallment().toFixed(2)}</Title>
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
                            Create order
                        </Button>
                    </Flex>
                </>
            )}
        </>
    )
}

export default CreateOrder
