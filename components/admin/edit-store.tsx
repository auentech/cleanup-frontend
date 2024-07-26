import useAxios from '@/common/axios'
import {
    BackendGeneralResponse,
    DistrictsResponse,
    FreeOperatorsResponse,
    StatesResponse,
    StoreResponse,
} from '@/common/types'
import {
    GlobeAsiaAustraliaIcon,
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Button,
    Divider,
    Flex,
    MultiSelect,
    MultiSelectItem,
    NumberInput,
    SearchSelect,
    SearchSelectItem,
    Text,
    TextInput,
} from '@tremor/react'
import { useRouter } from 'next/router'
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const EditStoreProfileSchema = z.object({
    address: z.string(),
    pincode: z.number(),
    state: z.string(),
    district: z.string(),
    emergency_contact: z.number()
})

const EditStoreSchema = z.object({
    name: z.string(),
    code: z.string(),
    operators: z.string().array().min(1),
    profile: EditStoreProfileSchema,
})

type EditStoreForm = z.infer<typeof EditStoreSchema>

const EditStore = () => {
    const axios = useAxios()
    const router = useRouter()
    const client = useQueryClient()

    const {
        data: store,
        isLoading: isStoreLoading,
        isError: isStoreError,
    } = useQuery({
        queryKey: ['store', router.query.store],
        queryFn: ({ signal }) =>
            axios.get<StoreResponse>('/stores/' + router.query.store, {
                params: {
                    include: [
                        'profile.state',
                        'profile.district',

                        'operators.user',
                        'operators.user.profile.state',
                        'operators.user.profile.district',
                    ],
                },
                signal,
            }),
        select: (data) => data.data,
    })

    const { data: freeOperators, isLoading: loadingFreeOperators } = useQuery({
        queryKey: ['free operators'],
        queryFn: ({ signal }) => axios.get<FreeOperatorsResponse>('/workers/free-operators', { signal }),
        select: data => data.data,
    })

    const { data: states, isLoading: statesLoading } = useQuery({
        queryKey: ['states'],
        queryFn: ({ signal }) => axios.get<StatesResponse>('/states/', { signal }),
        select: data => data.data
    })

    const { register, control, handleSubmit, formState: { errors } } = useForm<EditStoreForm>({
        values: {
            name: store?.data.name!,
            code: store?.data.code.split('-')?.[1]!,
            operators: store?.data.operators?.map(op => op.user_id + '')!,
            profile: {
                address: store?.data.profile?.address!,
                pincode: store?.data.profile?.pincode!,
                state: store?.data.profile?.state.id + '',
                district: store?.data.profile?.district.id + '',
                emergency_contact: store?.data.profile?.emergency_contact!,
            }
        },
        resolver: zodResolver(EditStoreSchema)
    })

    const stateSelected = useWatch({ control, name: 'profile.state' })
    const { data: districts, isLoading: districtsLoading } = useQuery({
        queryKey: ['states', stateSelected, 'districts'],
        queryFn: ({ signal }) => axios.get<DistrictsResponse>('/states/' + stateSelected, { signal }),
        select: data => data.data,
        enabled: !!stateSelected && stateSelected != undefined
    })

    const storeEditMutation = useMutation({
        mutationFn: (data: EditStoreForm) => axios.patch<BackendGeneralResponse>(
            '/stores/' + store?.data.id, data
        )
    })
    const handleStoreEdit: SubmitHandler<EditStoreForm> = data => storeEditMutation.mutate(data, {
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ['free operators'] })
            client.invalidateQueries({ queryKey: ['store', router.query.store] })
            toast.success("Store edited successfully")
        }
    })

    return (
        <form onSubmit={handleSubmit(handleStoreEdit)}>
            <div className="mt-4">
                <Text>Operators</Text>
                {isStoreLoading || loadingFreeOperators ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <Controller
                        control={control}
                        name='operators'
                        render={({ field }) => (
                            <MultiSelect
                                {...field}
                                className='mt-2'
                                onChange={v => { }}
                                onValueChange={field.onChange}
                                disabled={storeEditMutation.isPending}
                                defaultValue={store?.data.operators?.map(op => op.user_id + '')}
                            >
                                {store?.data.operators?.map(op => (
                                    <MultiSelectItem key={op.user_id} value={op.user_id + ''}>
                                        {[op.user?.name, op.user?.email, op.user?.phone].join(' - ')}
                                    </MultiSelectItem>
                                ))}

                                {freeOperators?.data?.map(op => (
                                    <MultiSelectItem key={op.id} value={op.id + ''}>
                                        {[op.name, op.email, op.phone].join(' - ')}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelect>
                        )}
                    />
                )}
            </div>

            <div className="mt-4">
                <Text>Store Name</Text>
                {isStoreLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <TextInput className="mt-2" {...register('name')} disabled={storeEditMutation.isPending} />
                )}
            </div>

            <div className="mt-4">
                <Text>Store Phone</Text>
                {isStoreLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <Controller
                        control={control}
                        name='profile.emergency_contact'
                        render={({ field }) => (
                            <NumberInput
                                {...field}
                                className='mt-2'
                                onChange={v => { }}
                                enableStepper={false}
                                onValueChange={field.onChange}
                                disabled={storeEditMutation.isPending}
                            />
                        )}
                    />
                )}
            </div>

            <div className="mt-4">
                <Text>Store Address</Text>
                {isStoreLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <TextInput className="mt-2" {...register('profile.address')} disabled={storeEditMutation.isPending} />
                )}
            </div>

            <div className="mt-4">
                <Text>Store custom code</Text>
                {isStoreLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <TextInput className="mt-2" {...register('code')} disabled={storeEditMutation.isPending} />
                )}
            </div>

            <div className="mt-4">
                <Text>Store Pincode</Text>
                {isStoreLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <Controller
                        control={control}
                        name='profile.emergency_contact'
                        render={({ field }) => (
                            <NumberInput
                                {...field}
                                className='mt-2'
                                onChange={v => { }}
                                enableStepper={false}
                                onValueChange={field.onChange}
                                disabled={storeEditMutation.isPending}
                            />
                        )}
                    />
                )}
            </div>

            <div className="mt-4">
                <Text>Store State</Text>
                {isStoreLoading || statesLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <Controller
                        control={control}
                        name='profile.state'
                        render={({ field }) => (
                            <SearchSelect
                                {...field}
                                className='mt-2'
                                onChange={v => { }}
                                onValueChange={field.onChange}
                                disabled={storeEditMutation.isPending}
                                defaultValue={store?.data.profile?.state.id + ''}
                            >
                                {states?.data.map(state => (
                                    <SearchSelectItem
                                        key={state.id}
                                        value={state.id + ''}
                                        icon={GlobeAsiaAustraliaIcon}
                                    >
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
                {isStoreLoading || districtsLoading ? (
                    <Skeleton className='mt-2 w-full h-9 rounded-lg' />
                ) : (
                    <Controller
                        control={control}
                        name='profile.district'
                        render={({ field }) => (
                            <SearchSelect
                                {...field}
                                className='mt-2'
                                onChange={v => { }}
                                onValueChange={field.onChange}
                                disabled={storeEditMutation.isPending}
                                defaultValue={store?.data.profile?.district.id + ''}
                            >
                                {districts?.data.districts.map(district => (
                                    <SearchSelectItem
                                        key={district.id}
                                        value={district.id + ''}
                                        icon={GlobeAsiaAustraliaIcon}
                                    >
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
                    loadingText="Editing store..."
                    loading={storeEditMutation.isPending}
                >
                    Edit store
                </Button>
            </Flex>
        </form>
    )
}

export default EditStore
