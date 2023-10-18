import useAxios from "@/common/axios"
import isUser from "@/common/middlewares/isUser"
import { BackendGeneralResponse, LoginResponse } from "@/common/types"
import OperatorNavigation from "@/components/operator/operator-navigation"
import { Title, Text, Card, Select, SelectItem, Grid, Col } from "@tremor/react"
import { AxiosError } from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { QrReader } from 'react-qr-reader'

const ScannerPage = () => {
    const axios = useAxios()
    const router = useRouter()

    const [code, setCode] = useState<string>()
    const [user, setUser] = useState<LoginResponse>()
    const [option, setOption] = useState<'view' | 'processed' | 'delivered'>()

    const handleScan = (result: any, error: any) => {
        if (typeof result?.text == 'string') {
            if (code == result.text) {
                return
            } else {
                setCode(result.text)
            }
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            const userResponse = await axios.get<LoginResponse>('user')
            setUser(userResponse.data)
        }

        fetchUser()
    }, [])

    useEffect(() => {
        if (code == undefined || user?.meta.store_id == undefined || option == undefined) {
            return
        }

        if (option == 'view') {
            router.push('/operator/stores/' + user.meta.store_id + '/orders/' + code)
            return
        }

        (async () => {
            try {
                const response = await axios.post<BackendGeneralResponse>('/orders/' + code + '/status', {
                    action: option
                })

                alert(response.data.message)
                router.reload()
            } catch (e) {
                alert('Unable to record action')
                router.reload()
            }
        })()
    }, [code])

    return (
        <div className="p-12">
            <Title>Order scanner</Title>
            <Text>You can know about an order or change it's status</Text>

            <OperatorNavigation />

            <div className="mt-6">
                <Card>
                    <Text>What do you want to do?</Text>
                    <Select className="mt-2" disabled={option != undefined} onValueChange={v => setOption(v as 'view' | 'processed' | 'delivered')}>
                        <SelectItem value="view">View order information</SelectItem>
                        <SelectItem value="processed">Mark order as processed</SelectItem>
                        <SelectItem value="delivered">Mark order as delivered</SelectItem>
                    </Select>

                    {option && (
                        <Grid numItemsLg={3}>
                            <Col numColSpan={1} />
                            <Col numColSpan={1}>
                                <QrReader constraints={{ height: 200 }} onResult={handleScan} />
                            </Col>
                            <Col />
                        </Grid>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default isUser(ScannerPage, ['operator'])
