import useAxios from "@/common/axios"
import { CreateStoreError, StatesResponse, FreeOperatorsResponse, DistrictsResponse, StoreResponse, BackendGeneralResponse } from "@/common/types"
import { GlobeAsiaAustraliaIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { Text, MultiSelect, MultiSelectItem, TextInput, SearchSelect, SearchSelectItem, Divider, Flex, Button } from "@tremor/react"
import lodashMap from 'lodash/map'
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

const EditStore = () => {
    const axios = useAxios()
    const router = useRouter()

    const [store, setStore] = useState<StoreResponse>()
    const [loading, setLoading] = useState<boolean>(false)
    const [errors, setErrors] = useState<CreateStoreError>()

    const [currentStoreOps, setCurrentStoreOps] = useState<string[]>()
    const [storeOperators, setStoreOperators] = useState<string[]>()

    const [storeName, setStoreName] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [code, setCode] = useState<string>('')
    const [pincode, setPincode] = useState<string>('')
    const [state, setState] = useState<string>('')
    const [district, setDistrict] = useState<string>('')

    const [states, setStates] = useState<StatesResponse>()
    const [operators, setOperators] = useState<FreeOperatorsResponse>()
    const [districts, setDistricts] = useState<DistrictsResponse>()

    useEffect(() => {
        const initOperators = async () => {
            if (store == undefined) return
            const opsResponse = await axios.get<FreeOperatorsResponse>('/workers/free-operators')

            const currentOperators = lodashMap(store?.data.operators, ops => ops.user)
            if (opsResponse.data.data.length > 0) {
                opsResponse.data.data.forEach(user => {
                    currentOperators.push(user)
                })

                setOperators({
                    data: currentOperators
                })

                return
            }

            setOperators({ data: currentOperators })
        }

        initOperators()
    }, [store])

    useEffect(() => {
        if (operators == undefined) return
        setCurrentStoreOps(lodashMap(store?.data.operators, ops => ops.user_id + ''))
        setStoreOperators(lodashMap(operators.data, ops => ops.id + ''))
    }, [operators])

    useEffect(() => {
        (async () => {
            const response = await axios.get<StatesResponse>('/states/')
            setStates(response.data)

            const storeResponse = await axios.get<StoreResponse>('/stores/' + router.query.store, {
                params: {
                    include: [
                        'profile.state',
                        'profile.district',

                        'operators.user',
                        'operators.user.profile.state',
                        'operators.user.profile.district'
                    ]
                }
            })

            setStore(storeResponse.data)
            setStoreName(storeResponse.data.data.name)
            setAddress(storeResponse.data.data.profile?.address as string)
            setCode(storeResponse.data.data.code.split('-')[1])
            setPincode(storeResponse.data.data?.profile?.pincode + '')
            setState(storeResponse.data.data.profile?.state.id + '')
            setDistrict(storeResponse.data.data.profile?.district.id + '')
        })()
    }, [])

    useEffect(() => {
        const fetchDistricts = async () => {
            const response = await axios.get<DistrictsResponse>('/states/' + state)
            setDistricts(response.data)
        }

        if (state != '') {
            fetchDistricts()
        }
    }, [state])

    const handleStoreEdit = async () => {
        setLoading(true)

        try {
            const storeEditResponse = await axios.patch<BackendGeneralResponse>('stores/' + store?.data.id, {
                operators: storeOperators,
                name: storeName,
                code: code,
                profile: {
                    address,
                    pincode,
                    state,
                    district,
                }
            })

            alert(storeEditResponse.data.message)
            router.reload()
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {currentStoreOps != undefined ? (
                <div className="mt-4">
                    <Text>Operators</Text>
                    <MultiSelect
                        onValueChange={setStoreOperators}
                        defaultValue={currentStoreOps}>
                        {operators != undefined ? operators.data.map(theOperator => (
                            <MultiSelectItem value={theOperator.id + ''} key={theOperator.id}>
                                {theOperator.name} - {theOperator.email} - {theOperator.phone}
                            </MultiSelectItem>
                        )) : (
                            <MultiSelectItem value="">
                                No free operators...
                            </MultiSelectItem>
                        )}
                    </MultiSelect>
                </div>
            ) : (
                <div className="mt-4">
                    <Text>Loading operators, please wait...</Text>
                </div>
            )}

            <div className="mt-4">
                <Text>Store Name</Text>
                <TextInput
                    value={storeName}
                    onInput={e => setStoreName(e.currentTarget.value)}
                    error={errors?.errors.name != undefined}
                    errorMessage="Store name is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Store Address</Text>
                <TextInput
                    value={address}
                    onInput={e => setAddress(e.currentTarget.value)}
                    error={errors?.errors["profile.address"] != undefined}
                    errorMessage="Store address is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Store custom code</Text>
                <TextInput
                    value={code}
                    onInput={e => setCode(e.currentTarget.value)}
                    error={errors?.errors.custom_code != undefined}
                    errorMessage="Custom code for store is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Store Pincode</Text>
                <TextInput
                    value={pincode}
                    onInput={e => setPincode(e.currentTarget.value)}
                    error={errors?.errors["profile.pincode"] != undefined}
                    errorMessage="Store pincode is required"
                    className="mt-2" />
            </div>

            {(states != undefined && store != undefined) && (
                <div className="mt-4">
                    <Text>Store State</Text>
                    <SearchSelect
                        defaultValue={store?.data?.profile?.state.id + ''}
                        className="mt-2" onValueChange={value => setState(value)}>
                        {states.data.map(theState => (
                            <SearchSelectItem value={theState.id + ''} key={theState.id} icon={GlobeAsiaAustraliaIcon}>
                                {theState.name}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                    {errors?.errors['profile.state'] && (
                        <Text color="red" className="mt-1">Please select a state</Text>
                    )}
                </div>
            )}

            <div className="mt-4">
                <Text>Store District</Text>
                <SearchSelect
                    defaultValue={store?.data?.profile?.district.id + ''}
                    className="mt-2"
                    onValueChange={value => setDistrict(value)}>
                    {districts != undefined ? districts.data.districts.map(theDistrict => (
                        <SearchSelectItem value={theDistrict.id + ''} key={theDistrict.id} icon={GlobeAsiaAustraliaIcon}>
                            {theDistrict.name}
                        </SearchSelectItem>
                    )) : (
                        <SearchSelectItem value="" icon={ArrowPathIcon}>
                            Loading...
                        </SearchSelectItem>
                    )}
                </SearchSelect>
                {errors?.errors['profile.district'] && (
                    <Text color="red" className="mt-1">Please select a district</Text>
                )}
            </div>

            <Divider />

            <Flex justifyContent="end" className="space-x-2">
                <Button
                    size="xs"
                    loading={loading}
                    loadingText="Editing store..."
                    onClick={handleStoreEdit}
                >Edit store</Button>
            </Flex>
        </>
    )
}

export default EditStore
