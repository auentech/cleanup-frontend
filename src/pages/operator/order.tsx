import useAxios from "@/common/axios"
import { ServicesResponse, UserSearchResponse } from "@/common/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Card, Col, Divider, Grid, NumberInput, SearchSelect, SearchSelectItem, Text, TextInput, Button, Select, SelectItem, DatePicker, List, ListItem, Title, Subtitle } from "@tremor/react"
import { useEffect, useState } from "react"
import { Control, Controller, SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { z } from "zod"
import clsx from 'clsx'
import { ReceiptPercentIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline"

const CreateNewCustomer = z.object({
    name: z.string(),
    phone: z.number(),
    address: z.string(),
    pincode: z.number(),
    email: z.string().email(),
})

const OrderEntrySchema = z.object({
    count: z.number().gte(1),
    service_id: z.number().gte(1),
    garment_id: z.number().gte(1),
})

const CreateOrderSchema = z.object({
    customer_id: z.number().optional(),
    new_customer: z.optional(CreateNewCustomer),
    orders: z.array(OrderEntrySchema),
    discount: z.number(),
    speed: z.number().gte(0).lt(4),
    due_date: z.date().optional(),
    mode: z.enum(['UPI', 'Card', 'Cash']),
    package: z.enum(['executive', 'economy']),
    installment: z.enum(['half', 'full', 'nil']),
}).superRefine((data, ctx) => {
    if (data.customer_id == undefined && data.new_customer == undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customer_id', 'new_customer'],
            message: 'Either select a customer or create a new customer',
        })
    }

    if (data.customer_id != undefined && data.new_customer != undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customer_id', 'new_customer'],
            message: 'Either select a customer or create a new customer',
        })
    }

    if (data.due_date == undefined && data.speed == 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['due_date'],
            message: 'Due date needs to be set if delivery is general',
        })
    }
})
type CreateOrder = z.infer<typeof CreateOrderSchema>

const Order = () => {
    const axios = useAxios()

    const [customerSearch, setCustomerSearch] = useState<string>('')
    const [bouncedCustomerSearch] = useDebounce(customerSearch, 300)

    const { data: customers, isLoading: customersLoading } = useQuery({
        queryKey: ['customers', bouncedCustomerSearch, 1],
        queryFn: ({ signal }) => axios.get<UserSearchResponse>('/search/customer', {
            signal,
            params: {
                search: bouncedCustomerSearch,
            },
        }),
        select: data => data.data
    })

    const { data: services, isLoading: servicesLoading } = useQuery({
        queryKey: ['services', 'garments'],
        queryFn: ({ signal }) => axios.get<ServicesResponse>('/services', {
            signal,
            params: {
                include: ['garments'],
            },
        }),
        select: data => data.data,
    })

    const { register, control, resetField, setValue, handleSubmit, formState: { errors } } = useForm<CreateOrder>({
        defaultValues: { discount: 0, mode: 'UPI', speed: 0, package: "economy", installment: 'nil', orders: [{}] },
        resolver: zodResolver(CreateOrderSchema),
    })
    const { fields, append, remove } = useFieldArray({ control, name: 'orders' })

    const handleCreateOrder: SubmitHandler<CreateOrder> = data => { }

    const customerID = useWatch({ control, name: 'customer_id' })
    useEffect(() => {
        resetField('new_customer')
    }, [customerID])

    const selectedSpeed = useWatch({ control, name: 'speed' })
    useEffect(() => {
        resetField('due_date')
    }, [selectedSpeed])

    const GetOrderTotalCost = () => {
        const orders = useWatch({ control, name: 'orders' })

        const costs = orders.map(order => {
            const service = services?.data.find(srv => srv.id == order.service_id)
            const garment = service?.garments?.find(grm => grm.id == order.garment_id)

            if (garment?.price_max == undefined) {
                return 0
            }

            return garment?.price_max * order.count
        })

        return costs.reduce((prevValue, currValue) => prevValue + currValue, 0)
    }

    const GetOrderTotalCostWithExtras = () => {
        const thePackage = useWatch({ control, name: 'package' })
        let totalCost = GetOrderTotalCost()

        switch (selectedSpeed) {
            case 1:
                totalCost *= 2
                break
            case 2:
                totalCost *= 1.5
                break
            case 3:
                totalCost *= 1.25
                break
            default:
                break
        }

        if (thePackage == 'economy') {
            totalCost -= totalCost * 0.15
        }

        return totalCost
    }

    const GrossTotalItem = () => {
        return (
            <ListItem>
                <Subtitle>Order Gross Total</Subtitle>
                <Title>₹ {GetOrderTotalCost()}</Title>
            </ListItem>
        )
    }

    const OrderExtrasCostItem = () => {
        const grossCost = GetOrderTotalCost()
        const totalCost = GetOrderTotalCostWithExtras()
        const displayCost = totalCost - grossCost

        if (displayCost == 0) {
            return <></>
        }

        return (
            <ListItem>
                <Subtitle>Extras</Subtitle>
                <Title
                    // @ts-ignore
                    color={clsx({
                        'red': displayCost < 0,
                        'green': displayCost > 0,
                    })}
                >₹ {(totalCost - grossCost).toFixed(2)}</Title>
            </ListItem>
        )
    }

    const DiscountedRateItem = () => {
        const totalCost = GetOrderTotalCostWithExtras()
        const discountPercentage = useWatch({ control, name: 'discount' })

        return (
            <ListItem>
                <Subtitle>Discounted Total</Subtitle>
                <Title>₹ {(totalCost - (discountPercentage / 100) * totalCost).toFixed(2)}</Title>
            </ListItem>
        )
    }

    const TaxRateItem = ({ type }: { type: 'CGST' | 'SGST' }) => {
        const totalCost = GetOrderTotalCostWithExtras()

        return (
            <ListItem>
                <Subtitle>{type}</Subtitle>
                <Title>₹ {(totalCost * (9 / 100)).toFixed(2)}</Title>
            </ListItem>
        )
    }

    const OrderNetTotalItem = () => {
        const totalCost = GetOrderTotalCostWithExtras()
        const discount = useWatch({ control, name: 'discount' })

        const discountedCost = totalCost - (discount / 100) * totalCost
        const totalWithTax = discountedCost + (discountedCost * (18 / 100))

        return (
            <ListItem>
                <Subtitle>Order Net Total</Subtitle>
                <Title>₹ {totalWithTax.toFixed(2)}</Title>
            </ListItem>
        )
    }

    const PayableCostItem = () => {
        const totalCost = GetOrderTotalCostWithExtras()
        const discount = useWatch({ control, name: 'discount' })
        const installment = useWatch({ control, name: 'installment' })

        const discountedCost = totalCost - (discount / 100) * totalCost
        let totalWithTax = discountedCost + (discountedCost * (18 / 100))

        switch (installment) {
            case 'half':
                totalWithTax = totalWithTax / 2
                break
            case 'nil':
                totalWithTax = 0
                break
        }

        return (
            <ListItem>
                <Subtitle>Payable Now</Subtitle>
                <Title>₹ {totalWithTax.toFixed(2)}</Title>
            </ListItem>
        )
    }

    const NewCustomerForm = () => {
        if (customerID == 0 || customerID == -1) {
            return (
                <div className="mt-4">
                    <Divider>New customer</Divider>

                    <Grid numItems={3} className="gap-6">
                        <div>
                            <Text>Customer Name</Text>
                            <TextInput {...register('new_customer.name')} className="mt-2" />
                        </div>

                        <div>
                            <Text>Customer Email</Text>
                            <TextInput {...register('new_customer.email')} className="mt-2" />
                        </div>

                        <div>
                            <Text>Customer Phone</Text>
                            <NumberInput
                                {...register('new_customer.phone')} onChange={v => { }}
                                onValueChange={v => setValue('new_customer.phone', v)}
                                className="mt-2" enableStepper={false} />
                        </div>
                    </Grid>

                    <div className="mt-4">
                        <Text>Customer Address</Text>
                        <TextInput {...register('new_customer.address')} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <Text>Customer Pincode</Text>
                        <NumberInput
                            {...register('new_customer.pincode')} onChange={v => { }}
                            onValueChange={v => setValue('new_customer.pincode', v)}
                            className="mt-2" enableStepper={false} />
                    </div>
                </div>
            )
        }

        return <></>
    }

    const GarmentSelector = ({ control, index }: { control: Control<CreateOrder>, index: number }) => {
        const serviceID = useWatch({ control, name: `orders.${index}.service_id` })
        const service = services?.data.find(service => service.id == serviceID)

        return (
            <Controller
                control={control}
                name={`orders.${index}.garment_id`}
                render={({ field }) => (
                    <SearchSelect
                        ref={field.ref}
                        className="mt-2"
                        defaultValue="0"
                        onBlur={field.onBlur}
                        value={field.value + ''}
                        onValueChange={v => field.onChange(parseInt(v))}
                    >
                        {servicesLoading ? (
                            <SearchSelectItem value="0">
                                Loading...
                            </SearchSelectItem>
                        ) : (
                            service?.garments?.map(garment => (
                                <SearchSelectItem key={garment.id} value={garment.id + ''}>
                                    {garment.name} - {garment.price_max}₹
                                </SearchSelectItem>
                            ))
                        )}
                    </SearchSelect>
                )}
            />
        )
    }

    const RemoveOrderEntry = ({ index }: { index: number }) => {
        const ordersEntry = useWatch({ control, name: 'orders' })

        return (
            <Button
                color='red'
                icon={TrashIcon}
                variant='secondary'
                className='mt-2 w-full'
                onClick={() => remove(index)}
                disabled={ordersEntry.length <= 1}
            />
        )
    }

    const DueDateField = () => {
        if (selectedSpeed == 0) {
            return (
                <div className="mt-4">
                    <Text>Due Date</Text>
                    <DatePicker
                        className="mt-2"
                        {...register('due_date')}
                        onValueChange={v => setValue('due_date', v)}
                    />
                </div>
            )
        }

        return <></>
    }

    return (
        <form onSubmit={handleSubmit(handleCreateOrder)} className="p-12">
            <Card>
                <Text>Customer</Text>
                <div className="mt-2">
                    <Controller
                        control={control}
                        name='customer_id'
                        render={({ field }) => (
                            <SearchSelect
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={field.value + ''}
                                onValueChange={v => field.onChange(parseInt(v))}
                                //@ts-ignore
                                onInput={node => setCustomerSearch(node.currentTarget.childNodes[0].childNodes[0].value)}
                            >
                                <SearchSelectItem value='0'>
                                    New Customer
                                </SearchSelectItem>

                                {customersLoading ? (
                                    <SearchSelectItem value='-1'>
                                        Searching for customer: {bouncedCustomerSearch}
                                    </SearchSelectItem>
                                ) : customers?.data.map(customer => (
                                    <SearchSelectItem value={customer.id + ''} key={customer.id}>
                                        {[customer.name, customer.phone, customer.email].join(' - ')}
                                    </SearchSelectItem>
                                ))}
                            </SearchSelect>
                        )}
                    />
                </div>

                {<NewCustomerForm />}

                <Divider>Order</Divider>

                {fields.map((field, i) => (
                    <Grid numItemsMd={12} className={clsx('gap-6', { 'mt-4': i > 0 })} key={field.id}>
                        <Col numColSpan={5}>
                            <Text>Service</Text>
                            <Controller
                                control={control}
                                name={`orders.${i}.service_id`}
                                render={({ field }) => (
                                    <SearchSelect
                                        ref={field.ref}
                                        className="mt-2"
                                        defaultValue="0"
                                        onBlur={field.onBlur}
                                        value={field.value + ''}
                                        onValueChange={v => field.onChange(parseInt(v))}
                                    >
                                        {servicesLoading ? (
                                            <SearchSelectItem value="0">
                                                Loading...
                                            </SearchSelectItem>
                                        ) : (
                                            services?.data.map(service => (
                                                <SearchSelectItem key={service.id} value={service.id + ''}>
                                                    {service.service}
                                                </SearchSelectItem>
                                            ))
                                        )}
                                    </SearchSelect>
                                )}
                            />
                        </Col>
                        <Col numColSpan={5}>
                            <Text>Garment</Text>
                            <GarmentSelector
                                control={control}
                                index={i}
                            />
                        </Col>
                        <Col numColSpan={1}>
                            <Text>Count</Text>
                            <NumberInput
                                {...register(`orders.${i}.count`)} onChange={v => { }}
                                onValueChange={v => setValue(`orders.${i}.count`, v)}
                                className="mt-2 min-w-full" enableStepper={false} />
                        </Col>
                        <Col numColSpan={1}>
                            <Text>Delete</Text>
                            <RemoveOrderEntry index={i} />
                        </Col>
                    </Grid>
                ))}

                <Button className="w-full mt-6" color="teal" variant="secondary" onClick={() => append({ service_id: 0, garment_id: 0, count: 0 })}>Add order</Button>

                <Divider>Extras</Divider>

                <div>
                    <Text>Discount</Text>
                    <NumberInput
                        className="mt-2"
                        icon={ReceiptPercentIcon}
                        {...register('discount')}
                        onChange={v => { }}
                        enableStepper={false}
                        onValueChange={v => setValue('discount', v)}
                    />
                </div>

                <div className="mt-4">
                    <Text>Delivery speed</Text>
                    <Controller
                        control={control}
                        name="speed"
                        render={({ field }) => (
                            <Select
                                ref={field.ref}
                                className="mt-2"
                                defaultValue="0"
                                onBlur={field.onBlur}
                                value={field.value + ''}
                                onValueChange={v => field.onChange(parseInt(v))}
                                enableClear={false}
                            >
                                <SelectItem value="1">1 Day delivery</SelectItem>
                                <SelectItem value="2">2 Day delivery</SelectItem>
                                <SelectItem value="3">3 Day delivery</SelectItem>
                                <SelectItem value="0">General delivery</SelectItem>
                            </Select>
                        )}
                    />
                </div>

                <DueDateField />

                <div className="mt-4">
                    <Text>Package</Text>
                    <Controller
                        control={control}
                        name="package"
                        render={({ field }) => (
                            <Select
                                {...field}
                                className="mt-2"
                                enableClear={false}
                                onValueChange={field.onChange}
                            >
                                <SelectItem value="executive">
                                    Executive package
                                </SelectItem>
                                <SelectItem value="economy">
                                    Economy package
                                </SelectItem>
                            </Select>
                        )}
                    />
                </div>

                <div className="mt-4">
                    <Text>First Installment</Text>
                    <Controller
                        control={control}
                        name="installment"
                        render={({ field }) => (
                            <Select
                                {...field}
                                className="mt-2"
                                enableClear={false}
                                onValueChange={field.onChange}
                            >
                                <SelectItem value="nil">
                                    No Payment
                                </SelectItem>
                                <SelectItem value="half">
                                    Half Payment
                                </SelectItem>
                                <SelectItem value="Full">
                                    Full Payment
                                </SelectItem>
                            </Select>
                        )}
                    />
                </div>

                <div className="mt-4">
                    <Text>Payment Method</Text>
                    <Controller
                        control={control}
                        name="mode"
                        render={({ field }) => (
                            <Select
                                {...field}
                                className="mt-2"
                                enableClear={false}
                                onValueChange={field.onChange}
                            >
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                            </Select>
                        )}
                    />
                </div>

                <Divider>Details</Divider>

                <List>
                    <GrossTotalItem />

                    <OrderExtrasCostItem />

                    <ListItem>
                        <Subtitle>Discount Given</Subtitle>
                        <Title>% {useWatch({ control, name: 'discount' })}</Title>
                    </ListItem>

                    <DiscountedRateItem />

                    <TaxRateItem type="CGST" />

                    <TaxRateItem type="SGST" />

                    <OrderNetTotalItem />

                    <PayableCostItem />
                </List>

                <Button type="submit" icon={ShoppingCartIcon} className="w-full mt-4">Place Order</Button>
            </Card>
        </form>
    )
}

export default Order
