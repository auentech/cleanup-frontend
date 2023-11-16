import useAxios from '@/common/axios'
import isUser from '@/common/middlewares/isUser'
import { BackendGeneralResponse, UserData } from '@/common/types'
import OperatorNavigation from '@/components/operator/operator-navigation'
import { Title, Text, Card, Select, SelectItem, Grid, Col } from '@tremor/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { QrReader } from 'react-qr-reader'

type Options = 'view' | 'rewash' | 'processed' | 'delivered'

const ScannerPage = () => {
    const axios = useAxios()
    const router = useRouter()
    const { data } = useSession()

    const user = data?.user as UserData

    const [code, setCode] = useState<string>()
    const [option, setOption] = useState<Options>()

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
        if (
            code == undefined ||
            user?.store_id == undefined ||
            option == undefined
        ) {
            return
        }

        if (option == 'view') {
            router.push('/operator/stores/' + user.store_id + '/orders/' + code)
            return
        }

        if (option == 'rewash') {
            router.push('/operator/rewash?order=' + code)
            return
        }

        ; (async () => {
            try {
                const response = await axios.post<BackendGeneralResponse>(
                    '/orders/' + code + '/status',
                    {
                        action: option,
                    },
                )

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
                    <Select
                        className="mt-2"
                        disabled={option != undefined}
                        onValueChange={(v) => setOption(v as Options)}
                    >
                        <SelectItem value="view">
                            View order information
                        </SelectItem>
                        <SelectItem value="rewash">
                            Put order to rewash
                        </SelectItem>
                        <SelectItem value="processed">
                            Mark order as processed
                        </SelectItem>
                    </Select>

                    {option && (
                        <Grid numItemsLg={3}>
                            <Col numColSpan={1} />
                            <Col numColSpan={1}>
                                <QrReader
                                    constraints={{ height: 200, facingMode: 'environment' }}
                                    onResult={handleScan}
                                />
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
