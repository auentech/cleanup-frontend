import useAxios from '@/common/axios'
import {
    BackendGeneralResponse,
    DistrictsResponse,
    FreeOperatorsResponse,
    StatesResponse,
} from '@/common/types'
import {
    CheckCircleIcon,
} from '@heroicons/react/24/outline'
import {
    Text,
    TextInput,
    SearchSelect,
    SearchSelectItem,
    Flex,
    Button,
    Callout,
    Divider,
    NumberInput,
} from '@tremor/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { SubmitHandler, useForm, Controller, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '@nextui-org/react'

const CreateStoreProfileSchema = z.object({
    address: z.string().min(5),
    pincode: z.number(),
    state: z.string().min(1),
    district: z.string().min(1),
    emergency_contact: z.number(),
})

const CreateStoreSchema = z.object({
    name: z.string().min(5),
    operator: z.string().min(1),
    custom_code: z.string().min(2),
    profile: CreateStoreProfileSchema
})

type CreateStore = z.infer<typeof CreateStoreSchema>

const CreateStore = () => {
    const router = useRouter()
    const axios = useAxios()

    const [selectedState, setSelectedState] = useState<string>('')

    const { data: states, isLoading: statesLoading } = useQuery({
        queryKey: ['states'],
        queryFn: ({ signal }) => axios.get<StatesResponse>('/states/', { signal }),
        select: data => data.data
    })

    const { data: districts, isLoading: districtsLoading } = useQuery({
        queryKey: ['states', selectedState, 'districts'],
        queryFn: ({ signal }) => axios.get<DistrictsResponse>('/states/' + selectedState, { signal }),
        select: data => data.data,
        enabled: selectedState !== ''
    })

    const { data: operators, isLoading: operatorsLoading } = useQuery({
        queryKey: ['free operators'],
        queryFn: () => axios.get<FreeOperatorsResponse>('/workers/free-operators'),
        select: data => data.data
    })

    const { register, reset, handleSubmit, control, formState: { errors } } = useForm<CreateStore>({
        defaultValues: {
            name: '',
            operator: '',
            custom_code: '',
            profile: {
                address: '',
                pincode: 0,
                state: '',
                district: '',
                emergency_contact: 0,
            },
        },
        resolver: zodResolver(CreateStoreSchema)
    })

    const createStoreMutation = useMutation({
        mutationFn: (data: CreateStore) => axios.post<BackendGeneralResponse>('/stores', data),
        onSuccess: () => reset()
    })
    const createStoreSubmit: SubmitHandler<CreateStore> = data => createStoreMutation.mutate(data)
    const stateSelection = useWatch({ control, name: 'profile.state' })

    useEffect(() => {
        setSelectedState(stateSelection)
    }, [stateSelection])

    return (
        <>
            <div className="mt-4">
                {createStoreMutation.isSuccess && (
                    <Callout
                        title="Action successfull"
                        color="green"
                        className='mt-4'
                        icon={CheckCircleIcon}
                    >
                        Store was created successfully - <span onClick={() => router.reload()}>Go back</span>
                    </Callout>
                )}
            </div>

            <form onSubmit={handleSubmit(createStoreSubmit)}>
                <div className="mt-4">
                    <Text>Store Operator</Text>
                    {operatorsLoading ? (
                        <Skeleton className="mt-2 w-full h-9 rounded-lg" />
                    ) : (
                        <Controller
                            control={control}
                            name='operator'
                            rules={{
                                required: 'Operator has to be selected'
                            }}
                            render={({ field }) => (
                                <SearchSelect
                                    {...field}
                                    className='mt-2'
                                    disabled={createStoreMutation.isPending}
                                >
                                    {operators?.data.map(op => (
                                        <SearchSelectItem key={op.id} value={op.id + ''}>
                                            {op.name} - {op.email} - {op.phone}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            )}
                        />
                    )}
                </div>

                <div className="mt-4">
                    <Text>Store Name</Text>
                    <TextInput
                        className="mt-2"
                        disabled={createStoreMutation.isPending}
                        {...register('name', { required: 'Name for the store is required' })}
                    />
                </div>

                <div className="mt-4">
                    <Text>Store Address</Text>
                    <TextInput
                        className="mt-2"
                        disabled={createStoreMutation.isPending}
                        {...register('profile.address', { required: 'Address for the store is required' })}
                    />
                </div>

                <div className="mt-4">
                    <Text>Store Contact</Text>
                    <Controller
                        control={control}
                        name='profile.emergency_contact'
                        render={({ field }) => (
                            <NumberInput
                                className="mt-2"
                                enableStepper={false}
                                disabled={createStoreMutation.isPending}
                                {...field}
                                onValueChange={field.onChange}
                                onChange={v => { }}
                            />
                        )}
                    />
                </div>

                <div className="mt-4">
                    <Text>Store custom code</Text>
                    <TextInput
                        className="mt-2"
                        disabled={createStoreMutation.isPending}
                        {...register('custom_code', { required: 'Code for the store is required' })}
                    />
                </div>

                <div className="mt-4">
                    <Text>Store Pincode</Text>
                    <Controller
                        control={control}
                        name='profile.pincode'
                        render={({ field }) => (
                            <NumberInput
                                className="mt-2"
                                enableStepper={false}
                                disabled={createStoreMutation.isPending}
                                {...field}
                                onValueChange={field.onChange}
                                onChange={v => { }}
                            />
                        )}
                    />
                </div>

                <div className="mt-4">
                    <Text>Store State</Text>
                    {statesLoading ? (
                        <Skeleton className="mt-2 w-full h-9 rounded-lg" />
                    ) : (
                        <Controller
                            control={control}
                            name='profile.state'
                            render={({ field }) => (
                                <SearchSelect
                                    {...field}
                                    className='mt-2'
                                    disabled={createStoreMutation.isPending}
                                >
                                    {states?.data.map(state => (
                                        <SearchSelectItem key={state.id} value={state.id + ''}>
                                            {state.name}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            )}
                        />
                    )}
                </div>

                <div className="mt-4">
                    <Text>Store District</Text>
                    {districtsLoading ? (
                        <Skeleton className="mt-2 w-full h-9 rounded-lg" />
                    ) : (
                        <Controller
                            control={control}
                            name='profile.district'
                            render={({ field }) => (
                                <SearchSelect
                                    {...field}
                                    className='mt-2'
                                    disabled={createStoreMutation.isPending}
                                >
                                    {districts?.data.districts.map(district => (
                                        <SearchSelectItem key={district.id} value={district.id + ''}>
                                            {district.name}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            )}
                        />
                    )}
                </div>

                <Divider />

                <Flex justifyContent="end" className="space-x-2">
                    <Button
                        size="xs"
                        type='submit'
                        loadingText="Creating store..."
                        loading={createStoreMutation.isPending}
                    >
                        Create new Store
                    </Button>
                </Flex>
            </form>
        </>
    )
}

export default CreateStore
