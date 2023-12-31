import useAxios from '@/common/axios'
import {
    BackendGeneralResponse,
    CreateStoreError,
    DistrictsResponse,
    FreeOperatorsResponse,
    StatesResponse,
} from '@/common/types'
import {
    ArrowPathIcon,
    CheckCircleIcon,
    GlobeAsiaAustraliaIcon,
    UsersIcon,
} from '@heroicons/react/24/outline'
import {
    Text,
    Select,
    SelectItem,
    TextInput,
    SearchSelect,
    SearchSelectItem,
    Flex,
    Button,
    Callout,
    Divider,
    NumberInput,
} from '@tremor/react'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import Axios from 'axios'
import { useRouter } from 'next/router'

const CreateStore = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<BackendGeneralResponse>()
    const [errors, setErrors] = useState<CreateStoreError>()

    const [operator, setOperator] = useState<string>('')
    const [storeName, setStoreName] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [code, setCode] = useState<string>('')
    const [pincode, setPincode] = useState<string>('')
    const [state, setState] = useState<string>('')
    const [district, setDistrict] = useState<string>('')
    const [contact, setContact] = useState<number>()

    const [states, setStates] = useState<StatesResponse>()
    const [operators, setOperators] = useState<FreeOperatorsResponse>()
    const [districts, setDistricts] = useState<DistrictsResponse>()

    const router = useRouter()
    const axios = useAxios()

    useEffect(() => {
        ;(async () => {
            const response = await axios.get<FreeOperatorsResponse>(
                '/workers/free-operators',
            )
            setOperators(response.data)
        })()
    }, [])

    useEffect(() => {
        ;(async () => {
            const response = await axios.get<StatesResponse>('/states/')
            setStates(response.data)
        })()
    }, [operator])

    useEffect(() => {
        const fetchDistricts = async () => {
            const response = await axios.get<DistrictsResponse>(
                '/states/' + state,
            )
            setDistricts(response.data)
        }

        if (state != '') {
            fetchDistricts()
        }
    }, [state])

    const handleStoreCreate = async () => {
        setLoading(true)

        try {
            const response = await axios.post<BackendGeneralResponse>(
                '/stores',
                {
                    name: storeName,
                    operator,
                    custom_code: code,
                    profile: {
                        address,
                        pincode,
                        state,
                        district,
                        emergency_contact: contact,
                    },
                },
            )

            setSuccess(response.data)
            alert(response.data.message)
            router.reload()
        } catch (e) {
            if (Axios.isAxiosError(e)) {
                const error = e as AxiosError
                setErrors(error.response?.data as any)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="mt-4">
                {success && (
                    <Callout
                        title="Action successfull"
                        color="green"
                        icon={CheckCircleIcon}
                    >
                        Store was created successfully
                    </Callout>
                )}
            </div>

            <div className="mt-4">
                <Text>Store Operator</Text>
                <Select
                    className="mt-2"
                    onValueChange={(value) => setOperator(value)}
                >
                    {operators != undefined ? (
                        operators.data.map((theOperator) => (
                            <SelectItem
                                value={theOperator.id}
                                key={theOperator.id}
                                icon={UsersIcon}
                            >
                                {theOperator.name} - {theOperator.email} -{' '}
                                {theOperator.phone}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="" icon={ArrowPathIcon}>
                            Loading...
                        </SelectItem>
                    )}
                </Select>
                {errors?.errors['profile.state'] && (
                    <Text color="red" className="mt-1">
                        Please select an Operator
                    </Text>
                )}
            </div>

            <div className="mt-4">
                <Text>Store Name</Text>
                <TextInput
                    value={storeName}
                    onInput={(e) => setStoreName(e.currentTarget.value)}
                    error={errors?.errors.name != undefined}
                    errorMessage="Store name is required"
                    className="mt-2"
                />
            </div>

            <div className="mt-4">
                <Text>Store Address</Text>
                <TextInput
                    value={address}
                    onInput={(e) => setAddress(e.currentTarget.value)}
                    error={errors?.errors['profile.address'] != undefined}
                    errorMessage="Store address is required"
                    className="mt-2"
                />
            </div>

            <div className="mt-4">
                <Text>Store Contact</Text>
                <NumberInput
                    value={contact}
                    onValueChange={setContact}
                    error={
                        errors?.errors['profile.emergency_contact'] != undefined
                    }
                    errorMessage="Proper contact number required"
                    className="mt-2"
                    enableStepper={false}
                />
            </div>

            <div className="mt-4">
                <Text>Store custom code</Text>
                <TextInput
                    value={code}
                    onInput={(e) => setCode(e.currentTarget.value)}
                    error={errors?.errors.custom_code != undefined}
                    errorMessage="Custom code for store is required"
                    className="mt-2"
                />
            </div>

            <div className="mt-4">
                <Text>Store Pincode</Text>
                <TextInput
                    value={pincode}
                    onInput={(e) => setPincode(e.currentTarget.value)}
                    error={errors?.errors['profile.pincode'] != undefined}
                    errorMessage="Store pincode is required"
                    className="mt-2"
                />
            </div>

            <div className="mt-4">
                <Text>Store State</Text>
                <SearchSelect
                    className="mt-2"
                    onValueChange={(value) => setState(value)}
                >
                    {states != undefined ? (
                        states.data.map((theState) => (
                            <SearchSelectItem
                                value={theState.id as unknown as string}
                                key={theState.id}
                                icon={GlobeAsiaAustraliaIcon}
                            >
                                {theState.name}
                            </SearchSelectItem>
                        ))
                    ) : (
                        <SearchSelectItem value="" icon={ArrowPathIcon}>
                            Loading...
                        </SearchSelectItem>
                    )}
                </SearchSelect>
                {errors?.errors['profile.state'] && (
                    <Text color="red" className="mt-1">
                        Please select a state
                    </Text>
                )}
            </div>

            <div className="mt-4">
                <Text>Store District</Text>
                <SearchSelect
                    className="mt-2"
                    onValueChange={(value) => setDistrict(value)}
                >
                    {districts != undefined ? (
                        districts.data.districts.map((theDistrict) => (
                            <SearchSelectItem
                                value={theDistrict.id as unknown as string}
                                key={theDistrict.id}
                                icon={GlobeAsiaAustraliaIcon}
                            >
                                {theDistrict.name}
                            </SearchSelectItem>
                        ))
                    ) : (
                        <SearchSelectItem value="" icon={ArrowPathIcon}>
                            Loading...
                        </SearchSelectItem>
                    )}
                </SearchSelect>
                {errors?.errors['profile.district'] && (
                    <Text color="red" className="mt-1">
                        Please select a district
                    </Text>
                )}
            </div>

            <Divider />

            <Flex justifyContent="end" className="space-x-2">
                <Button
                    size="xs"
                    loading={loading}
                    loadingText="Creating store..."
                    onClick={handleStoreCreate}
                >
                    Create new Store
                </Button>
            </Flex>
        </>
    )
}

export default CreateStore
