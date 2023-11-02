import useAxios from "@/common/axios"
import { BackendGeneralResponse, CreateWorkerErrors, DistrictsResponse, StatesResponse } from "@/common/types"
import { GlobeAsiaAustraliaIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { Button, Callout, Divider, Flex, NumberInput, SearchSelect, SearchSelectItem, Select, SelectItem, Text, TextInput } from "@tremor/react"
import { useEffect, useState } from "react"
import Axios, { AxiosError } from 'axios'
import { useRouter } from "next/router"

const CreateWorker = () => {
    const axios = useAxios()
    const router = useRouter()

    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<BackendGeneralResponse>()
    const [errors, setErrors] = useState<CreateWorkerErrors>()

    const [role, setRole] = useState<string>()
    const [name, setName] = useState<string>()
    const [email, setEmail] = useState<string>()
    const [phone, setPhone] = useState<string>()
    const [state, setState] = useState<string>('')
    const [address, setAddress] = useState<string>()
    const [pincode, setPincode] = useState<string>()
    const [aadhaar, setAadhaar] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [district, setDistrict] = useState<string>('')
    const [emergencyContact, setEmergencyContact] = useState<string>()

    const [states, setStates] = useState<StatesResponse>()
    const [districts, setDistricts] = useState<DistrictsResponse>()

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
        }
    }, [state])

    const handleWorkerCreation = async () => {
        setLoading(true)

        try {
            const response = await axios.post<BackendGeneralResponse>('/workers', {
                role,
                name,
                email,
                phone,
                password,
                profile: {
                    state,
                    pincode,
                    district,
                    aadhaar,
                    address,
                    emergency_contact: emergencyContact,
                }
            })

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
            {success && (
                <div className="mt-4">
                    <Callout title="Action successfull" color="green" icon={CheckCircleIcon}>
                        Store was created successfully
                    </Callout>
                </div>
            )}

            <div className="mt-4">
                <Text>Worker role</Text>
                <Select className="mt-2" onValueChange={setRole}>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="ironer">Ironer</SelectItem>
                    <SelectItem value="washer">Washer</SelectItem>
                    <SelectItem value="packer">Packer</SelectItem>
                </Select>
                {errors?.errors.role && (
                    <Text color="red" className="mt-1">Please select a valid role</Text>
                )}
            </div>

            <div className="mt-4">
                <Text>Worker name</Text>
                <TextInput
                    className="mt-2"
                    onInput={e => setName(e.currentTarget.value)}
                    error={errors?.errors.name != undefined}
                    errorMessage="Please enter valid worker name"
                />
            </div>

            <div className="mt-4">
                <Text>Worker email</Text>
                <TextInput
                    type="email"
                    className="mt-2"
                    onInput={e => setEmail(e.currentTarget.value)}
                    error={errors?.errors.email != undefined}
                    errorMessage="Please enter valid worker email"
                />
            </div>

            <div className="mt-4">
                <Text>Worker password</Text>
                <TextInput
                    type="password"
                    className="mt-2"
                    onInput={e => setPassword(e.currentTarget.value)}
                    error={errors?.errors.password != undefined}
                    errorMessage="Please enter valid worker password"
                />
            </div>

            <div className="mt-4">
                <Text>Worker phone</Text>
                <NumberInput
                    className="mt-2"
                    onInput={e => setPhone(e.currentTarget.value)}
                    error={errors?.errors.phone != undefined}
                    errorMessage="Please enter valid worker phone"
                />
            </div>

            <div className="mt-4">
                <Text>Worker address</Text>
                <TextInput
                    className="mt-2"
                    onInput={e => setAddress(e.currentTarget.value)}
                    error={errors?.errors["profile.address"] != undefined}
                    errorMessage="Please enter valid worker address"
                />
            </div>

            <div className="mt-4">
                <Text>Worker pincode</Text>
                <NumberInput
                    className="mt-2"
                    onInput={e => setPincode(e.currentTarget.value)}
                    error={errors?.errors["profile.pincode"] != undefined}
                    errorMessage="Please enter valid worker pincode"
                />
            </div>

            <div className="mt-4">
                <Text>Worker aadhaar</Text>
                <NumberInput
                    className="mt-2"
                    onInput={e => setAadhaar(e.currentTarget.value)}
                    error={errors?.errors["profile.aadhaar"] != undefined}
                    errorMessage="Please enter valid worker aadhaar"
                />
            </div>

            <div className="mt-4">
                <Text>Worker emergency contact</Text>
                <NumberInput
                    className="mt-2"
                    onInput={e => setEmergencyContact(e.currentTarget.value)}
                    error={errors?.errors["profile.emergency_contact"] != undefined}
                    errorMessage="Please enter valid worker emergency contact"
                />
            </div>

            <div className="mt-4">
                <Text>Worker state</Text>
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
                <Text>Worker district</Text>
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
                    loadingText="Adding new worker..."
                    onClick={handleWorkerCreation}
                >Add new worker</Button>
            </Flex>
        </>
    )
}

export default CreateWorker
