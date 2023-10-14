import useAxios from "@/common/axios"
import { CreateStoreError, StatesResponse, FreeOperatorsResponse, DistrictsResponse, StoreResponse } from "@/common/types"
import { GlobeAsiaAustraliaIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { Text, MultiSelect, MultiSelectItem, TextInput, SearchSelect, SearchSelectItem, Divider, Flex, Button } from "@tremor/react"
import _ from "lodash"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

const EditStore = () => {
    const cAxios = useAxios()
    const cRouter = useRouter()

    const [cStore, setcStore] = useState<StoreResponse>()
    const [cLoading, setcLoading] = useState<boolean>(false)
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
            if (cStore == undefined) return
            const opsResponse = await cAxios.get<FreeOperatorsResponse>('/workers/free-operators')

            const currentOperators = _.map(cStore?.data.operators, ops => ops.user)
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
    }, [cStore])

    useEffect(() => {
        if (operators == undefined) return
        setCurrentStoreOps(_.map(operators.data, ops => ops.id + ''))
        setStoreOperators(_.map(operators.data, ops => ops.id + ''))
    }, [operators])

    useEffect(() => {
        (async () => {
            const response = await cAxios.get<StatesResponse>('/states/')
            setStates(response.data)

            const storeResponse = await cAxios.get<StoreResponse>('/stores/' + cRouter.query.store, {
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

            setcStore(storeResponse.data)
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
            const response = await cAxios.get<DistrictsResponse>('/states/' + state)
            setDistricts(response.data)
        }

        if (state != '') {
            fetchDistricts()
        }
    }, [state])

    const handleStoreEdit = async () => {
        setcLoading(true)

        try {
            const response = await cAxios.patch('stores/' + cStore?.data.id, {
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

            console.log(response.data)
        } finally {
            setcLoading(false)
        }
    }

    return (
        <>
            {currentStoreOps != undefined && (
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
            )}

            <div className="mt-4">
                <Text>Store Name</Text>
                <TextInput
                    value={cStore?.data.name}
                    onInput={e => setStoreName(e.currentTarget.value)}
                    error={errors?.errors.name != undefined}
                    errorMessage="Store name is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Store Address</Text>
                <TextInput
                    value={cStore?.data?.profile?.address}
                    onInput={e => setAddress(e.currentTarget.value)}
                    error={errors?.errors["profile.address"] != undefined}
                    errorMessage="Store address is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Store custom code</Text>
                <TextInput
                    value={cStore?.data.code.split('-')[1]}
                    onInput={e => setCode(e.currentTarget.value)}
                    error={errors?.errors.custom_code != undefined}
                    errorMessage="Custom code for store is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Store Pincode</Text>
                <TextInput
                    value={cStore?.data?.profile?.pincode + ''}
                    onInput={e => setPincode(e.currentTarget.value)}
                    error={errors?.errors["profile.pincode"] != undefined}
                    errorMessage="Store pincode is required"
                    className="mt-2" />
            </div>

            {(states != undefined && cStore != undefined) && (
                <div className="mt-4">
                    <Text>Store State</Text>
                    <SearchSelect
                        defaultValue={cStore?.data?.profile?.state.id + ''}
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
                    defaultValue={cStore?.data?.profile?.district.id + ''}
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
                    loading={cLoading}
                    loadingText="Editing store..."
                    onClick={handleStoreEdit}
                >Edit store</Button>
            </Flex>
        </>
    )
}

export default EditStore
