import useAxios from "@/common/axios"
import { BackendGeneralResponse, CreateFactoryError, DistrictsResponse, StatesResponse } from "@/common/types"
import { GlobeAsiaAustraliaIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { TextInput, SearchSelect, SearchSelectItem, Flex, Button, Text, Callout, Divider } from "@tremor/react"
import { useEffect, useState } from "react"
import Axios, { AxiosError } from 'axios'

const CreateFactory = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [errors, setErrors] = useState<CreateFactoryError>()
    const [success, setSuccess] = useState<BackendGeneralResponse>()

    const [code, setCode] = useState<string>('')
    const [state, setState] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [pincode, setPincode] = useState<string>('')
    const [district, setDistrict] = useState<string>('')
    const [factoryName, setFactoryName] = useState<string>('')

    const [states, setStates] = useState<StatesResponse>()
    const [districts, setDistricts] = useState<DistrictsResponse>()

    const axios = useAxios()

    useEffect(() => {
        (async () => {
            const response = await axios.get<StatesResponse>('/states/')
            setStates(response.data)
        })()
    }, [])

    useEffect(() => {
        const fetchDistricts = async () => {
            const response = await axios.get<DistrictsResponse>('/states/' + state)
            setDistricts(response.data)
        }

        if (state != '') {
            fetchDistricts()
            return
        }

        setDistricts(undefined)
    }, [state])

    const handleFactoryCreate = async () => {
        setLoading(true)

        try {
            const response = await axios.post('/factories', {
                name: factoryName,
                custom_code: code,
                profile: {
                    address,
                    pincode,
                    state,
                    district,
                }
            })

            setSuccess(response.data)
            setInterval(() => wipeSlate, 2000)
        } catch (e) {
            if (Axios.isAxiosError(e)) {
                const error = e as AxiosError
                setErrors(error.response?.data as any)
            }
        } finally {
            setLoading(false)
        }
    }

    const wipeSlate = () => {
        setCode('')
        setState('')
        setAddress('')
        setPincode('')
        setDistrict('')
        setFactoryName('')
        setErrors(undefined)
        setSuccess(undefined)
    }

    return (
        <>
            {success && (
                <div className="mt-4">
                    <Callout title="Action successfull" color="green" icon={CheckCircleIcon}>
                        Factory was created successfully
                    </Callout>
                </div>
            )}

            <div className="mt-4">
                <Text>Factory Name</Text>
                <TextInput
                    onInput={e => setFactoryName(e.currentTarget.value)}
                    error={errors?.errors.name != undefined}
                    errorMessage="Factory name is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Factory Address</Text>
                <TextInput
                    onInput={e => setAddress(e.currentTarget.value)}
                    error={errors?.errors["profile.address"] != undefined}
                    errorMessage="Factory address is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Factory custom code</Text>
                <TextInput
                    onInput={e => setCode(e.currentTarget.value)}
                    error={errors?.errors.custom_code != undefined}
                    errorMessage="Custom code for Factory is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Factory Pincode</Text>
                <TextInput
                    onInput={e => setPincode(e.currentTarget.value)}
                    error={errors?.errors["profile.pincode"] != undefined}
                    errorMessage="Factory pincode is required"
                    className="mt-2" />
            </div>

            <div className="mt-4">
                <Text>Factory State</Text>
                <SearchSelect
                    className="mt-2" onValueChange={value => setState(value)}>
                    {states != undefined ? states.data.map(theState => (
                        <SearchSelectItem value={theState.id as unknown as string} key={theState.id} icon={GlobeAsiaAustraliaIcon}>
                            {theState.name}
                        </SearchSelectItem>
                    )) : (
                        <SearchSelectItem value="" icon={ArrowPathIcon}>
                            Loading...
                        </SearchSelectItem>
                    )}
                </SearchSelect>
                {errors?.errors['profile.state'] && (
                    <Text color="red" className="mt-1">Please select a state</Text>
                )}
            </div>

            <div className="mt-4">
                <Text>Factory District</Text>
                <SearchSelect className="mt-2" onValueChange={value => setDistrict(value)}>
                    {districts != undefined ? districts.data.districts.map(theDistrict => (
                        <SearchSelectItem value={theDistrict.id as unknown as string} key={theDistrict.id} icon={GlobeAsiaAustraliaIcon}>
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
                    loadingText="Creating Factory..."
                    onClick={handleFactoryCreate}
                >Create new Factory</Button>
            </Flex>
        </>
    )
}

export default CreateFactory
