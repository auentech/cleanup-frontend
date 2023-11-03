import useAxios from "@/common/axios"
import { OrderGarment, OrderService, ServicesResponse, StoreResponse, UserData, UserSearchResponse } from "@/common/types"
import { CheckIcon, PlusCircleIcon, ShoppingCartIcon, UserIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { Button, Callout, Col, Divider, Flex, Grid, List, ListItem, NumberInput, Select, SelectItem, Text, TextInput, Title } from "@tremor/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

type LocalOrders = {
    service_id: string,
    garment_id: string
    count: number
}

type CreateOrderType = {
    store: StoreResponse
}

const CreateOrder = ({ store }: CreateOrderType) => {
    const axios = useAxios()
    const router = useRouter()

    const [showCustomerForm, setShowCustomerForm] = useState(false)
    const [customers, setCustomers] = useState<UserSearchResponse>()
    const [customerSearch, setCustomerSearch] = useState<string>()
    const [selectedCustomer, setSelectedCustomer] = useState<UserData>()

    const [speed, setSpeed] = useState<string>('4')
    const [thePackage, setThePackage] = useState<string>('1')
    const [installment, setInstallment] = useState<'full' | 'half'>()
    const [serviceAvailed, setServiceAvailed] = useState<number>(1)
    const [services, setServices] = useState<ServicesResponse>()

    const [selectedServices, setSelectedServices] = useState<string[]>([])
    const [selectedGarments, setSelectedGarments] = useState<string[]>([])
    const [selectedPieces, setSelectedPieces] = useState<number[]>([])

    const [customerName, setCustomerName] = useState<string>()
    const [customerphone, setCustomerPhone] = useState<number>()
    const [customeremail, setCustomerEmail] = useState<string>()
    const [customeraddress, setCustomerAddress] = useState<string>()
    const [customerpincode, setCustomerPincode] = useState<number>()

    const [cost, setCost] = useState<number>(0)
    const [ogCost, setOGCost] = useState<number>(0)
    const [discount, setDiscount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)

    const handleCustomerSearch = (value: string) => {
        setCustomerSearch(value)
    }

    const handleServicesInput = (index: number, value: string) => {
        const newSelectedServices = [...selectedServices as string[]]
        newSelectedServices[index] = value
        setSelectedServices(newSelectedServices)
    }

    const handleGarmentsInput = (index: number, value: string) => {
        const newSelectedGarments = [...selectedGarments as string[]]
        newSelectedGarments[index] = value
        setSelectedGarments(newSelectedGarments)
    }

    const handlePiecesInput = (index: number, value: number) => {
        const newPeices = [...selectedPieces as number[]]
        newPeices[index] = value
        setSelectedPieces(newPeices)
    }

    const handleCustomerSelection = (value: UserData) => {
        setSelectedCustomer(value)
    }

    const getGarments = (i: number) => {
        let elements: any = []

        const serviceID = selectedServices[i]

        if (serviceID == undefined) {
            return
        }

        const service = services?.data.filter(service => (service.id + '') === serviceID)[0] as OrderService

        service.garments?.forEach(garment => {
            elements.push(
                <SelectItem key={garment.id} value={garment.id + ''}>
                    {garment.name} - {garment.price_max} ₹
                </SelectItem>
            )
        })

        return elements
    }

    useEffect(() => {
        const fetchCustomers = async () => {
            const customersResponse = await axios.get<UserSearchResponse>('/search/customer', {
                params: {
                    search: customerSearch
                }
            })

            setCustomers(customersResponse.data)
        }

        fetchCustomers()
    }, [customerSearch])

    useEffect(() => {
        const fetchServices = async () => {
            const servicesResponse = await axios.get<ServicesResponse>('/services')
            setServices(servicesResponse.data)
        }

        fetchServices()
    }, [])

    useEffect(() => {
        if (selectedPieces.includes(NaN)) {
            return
        }

        setCost(0)
        setOGCost(0)
        selectedServices.forEach((serviceID, index) => {
            const garmentID = selectedGarments[index]
            const pieces = selectedPieces[index]

            const service = services?.data.filter(service => service.id + '' === serviceID)[0] as OrderService
            const garment = service.garments?.filter(garment => garment.id + '' === garmentID)[0] as OrderGarment

            setCost(oldCost => (garment.price_max * pieces) + oldCost)
            setOGCost(oldCost => (garment.price_max * pieces) + oldCost)
        })
    }, [selectedPieces, selectedGarments])

    useEffect(() => {
        const speedInt: number = parseInt(speed)

        if (speedInt == 1) {
            setCost(ogCost + ogCost)
        } else if (speedInt == 2) {
            setCost((ogCost * (50 / 100)) + ogCost)
        } else if (speedInt == 3) {
            setCost((ogCost * (25 / 100)) + ogCost)
        } else {
            setCost(ogCost)
        }
    }, [speed])

    useEffect(() => {
        const packageInt: number = parseInt(thePackage)

        switch (packageInt) {
            case 1:
                setCost(ogCost)
                break
            case 2:
                setCost(theCost => theCost - (theCost * (20 / 100)))
                break
        }
    }, [thePackage])

    const handleOrderCreate = async () => {
        setLoading(true)

        let orders: LocalOrders[] = []
        selectedServices.forEach((serviceID, index) => orders.push({
            service_id: serviceID,
            garment_id: selectedGarments[index],
            count: selectedPieces[index],
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

                await axios.post('/stores/' + store.data.id + '/orders', {
                    cost,
                    speed,
                    orders,
                    discount,
                    installment,
                    new_customer,
                })

                router.reload()

                return
            }

            await axios.post('/stores/' + store.data.id + '/orders', {
                cost,
                speed,
                orders,
                discount,
                installment,
                customer_id: selectedCustomer?.id,
            })

            router.reload()
        } catch {

        } finally {
            setLoading(false)
        }
    }

    const renderService = () => {
        let elements = []

        for (let i = 0; i < serviceAvailed; i++) {
            elements.push(
                <div className="mt-4" key={i}>
                    <Grid numItemsMd={3} className="gap-6">
                        <Col>
                            <Text>Service</Text>
                            <Select
                                className="mt-2"
                                onValueChange={value => handleServicesInput(i, value)}
                                value={selectedServices?.[i] as string}
                                enableClear={false}
                            >
                                {services?.data.map(service => (
                                    <SelectItem key={service.id} value={service.id + ''}>{service.service}</SelectItem>
                                )) || (
                                        <SelectItem value=''>Loading...</SelectItem>
                                    )}
                            </Select>
                        </Col>
                        <Col>
                            <Text>Garment</Text>
                            <Select
                                onValueChange={value => handleGarmentsInput(i, value)}
                                value={selectedGarments?.[i] as string}
                                className="mt-2"
                                enableClear={false}
                            >
                                {getGarments(i)}
                            </Select>
                        </Col>
                        <Col>
                            <Text>Count</Text>
                            <NumberInput
                                onValueChange={value => handlePiecesInput(i, value)}
                                value={selectedPieces?.[i] as number}
                                min={1}
                                enableStepper={false}
                                className="mt-2"
                            />
                        </Col>
                    </Grid>
                </div>
            )
        }

        return elements
    }

    return (
        <>
            {selectedCustomer != undefined && (
                <Callout className="mt-4" title="Customer selected" icon={UserIcon}>
                    This order is now created for {selectedCustomer.name}
                </Callout>
            )}

            {(!showCustomerForm && selectedCustomer == undefined) && (
                <>
                    <div className="mt-4">
                        <Text>Search customer</Text>
                        <TextInput placeholder="Search..." className="mt-2" onInput={e => handleCustomerSearch(e.currentTarget.value)} />
                    </div>

                    {customers && (
                        <List className="mt-4">
                            {customers.data.map(customer => (
                                <ListItem key={customer.id}>
                                    <Text>{customer.name} - {customer.phone} - {customer.email}</Text>
                                    <Button size="xs" variant="secondary" color="gray" icon={CheckIcon} onClick={() => handleCustomerSelection(customer)}>
                                        Select customer
                                    </Button>
                                </ListItem>
                            ))}
                            <ListItem>
                                <Text>New customer?</Text>
                                <Button size="xs" variant="secondary" color="blue" icon={UserPlusIcon} onClick={() => setShowCustomerForm(true)}>
                                    Create customer
                                </Button>
                            </ListItem>
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
                            onInput={e => setCustomerName(e.currentTarget.value)} />
                    </div>

                    <div className="mt-4">
                        <Text>Customer phone</Text>
                        <NumberInput
                            className="mt-2"
                            onValueChange={setCustomerPhone} />
                    </div>

                    <div className="mt-4">
                        <Text>Customer email</Text>
                        <TextInput
                            type="email"
                            className="mt-2"
                            onInput={e => setCustomerEmail(e.currentTarget.value)} />
                    </div>

                    <div className="mt-4">
                        <Text>Customer address</Text>
                        <TextInput
                            type="email"
                            className="mt-2"
                            onInput={e => setCustomerAddress(e.currentTarget.value)} />
                    </div>

                    <div className="mt-4">
                        <Text>Customer pincode</Text>
                        <NumberInput
                            className="mt-2"
                            onValueChange={setCustomerPincode} />
                    </div>
                </>
            )}

            {(selectedCustomer || showCustomerForm) && (
                <>
                    <Divider />

                    {renderService()}

                    <Divider />

                    <div className="mt-4">
                        <Text>Discount</Text>
                        <NumberInput onValueChange={setDiscount} className="mt-2" />
                    </div>


                    <List className="mt-4">
                        <ListItem>
                            <Title>Order Gross Total</Title>
                            <Title>₹ {cost}</Title>
                        </ListItem>
                        <ListItem>
                            <Title>Discount given</Title>
                            <Title>₹ {discount}</Title>
                        </ListItem>
                        <ListItem>
                            <Title>Order Net Total</Title>
                            <Title>₹ {cost - discount}</Title>
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
                            <Flex justifyContent="between" className="gap-6">
                                <Title>First installment</Title>
                                <div>
                                    <Button
                                        color={installment == 'half' ? 'blue' : 'gray'}
                                        onClick={e => setInstallment('half')}
                                        variant="secondary"
                                        className="ml-2"
                                    >Half</Button>
                                    <Button
                                        color={installment == 'full' ? 'blue' : 'gray'}
                                        onClick={e => setInstallment('full')}
                                        variant="secondary"
                                        className="ml-2"
                                    >Full</Button>
                                </div>
                            </Flex>
                        </ListItem>
                        {installment != undefined && (
                            <ListItem>
                                <Title>To pay now</Title>
                                <Title>
                                    ₹ {installment == 'full' ? (cost - discount) : ((cost - discount) / 2)}
                                </Title>
                            </ListItem>
                        )}
                    </List>

                    <div className="py-2">
                        <Title>Delivery speed</Title>
                        <Select value={speed} onValueChange={setSpeed} enableClear={false} className="mt-2">
                            <SelectItem value="1">1 Day delivery</SelectItem>
                            <SelectItem value="2">2 Day delivery</SelectItem>
                            <SelectItem value="3">3 Day delivery</SelectItem>
                            <SelectItem value="4">General delivery</SelectItem>
                        </Select>
                    </div>

                    <div className="py-2">
                        <Title>Package</Title>
                        <Select value={thePackage} onValueChange={setThePackage} enableClear={false} className="mt-2">
                            <SelectItem value="1">Executive package</SelectItem>
                            <SelectItem value="2">General package</SelectItem>
                        </Select>
                    </div>

                    <Flex justifyContent="end" className="gap-6 mt-4">
                        <Button variant="secondary" icon={PlusCircleIcon} onClick={() => setServiceAvailed(count => count + 1)}>Add service</Button>
                        <Button
                            icon={ShoppingCartIcon}
                            loading={loading}
                            disabled={installment == undefined}
                            loadingText="Creating order..."
                            onClick={handleOrderCreate}
                        >Create order</Button>
                    </Flex>
                </>
            )}
        </>
    )
}

export default CreateOrder
