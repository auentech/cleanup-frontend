import { Title, Card, Grid, Col, Text, Italic } from '@tremor/react'
import { QrReader } from 'react-qr-reader'
import useAxios from '@/common/axios'
import { BackendGeneralResponse, UserData } from '@/common/types'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Logout from '@/common/logout'
import { AxiosError } from 'axios'

type WorkerHomeType = {
    role: 'washer' | 'packer' | 'ironer'
}

const WorkerHome = ({ role }: WorkerHomeType) => {
    const axios = useAxios()
    const router = useRouter()
    const session = useSession()

    const user = session.data?.user as UserData
    const [code, setCode] = useState<string>()

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
        if (code == undefined) {
            return
        }

        let action = ''
        switch (role) {
            case 'ironer':
                action = 'ironed'
                break
            case 'washer':
                action = 'washed'
                break
            case 'packer':
                action = 'packed'
                break
            default:
                action = 'unknown'
        }

        ;(async () => {
            try {
                const response = await axios.post<BackendGeneralResponse>(
                    '/orders/' + code + '/status',
                    {
                        action,
                    },
                )

                alert(response.data.message)
                router.reload()
            } catch (e) {
                const error = e as AxiosError
                const response = error.response?.data as BackendGeneralResponse

                alert(response.message)
                router.reload()
            }
        })()
    }, [code])

    return (
        <div className="p-12">
            <Title>Welcome {user.name}</Title>
            <Text>
                Ready to update some orders?{' '}
                <Italic style={{ color: '#ef4444', cursor: 'pointer' }}>
                    <Logout />
                </Italic>
            </Text>

            <div className="mt-6">
                <Card>
                    <Title>Order scanner</Title>
                    <Text>Time to change the order status</Text>
                    <Grid numItemsLg={3} className="mt-6">
                        <Col numColSpan={1} />
                        <Col numColSpan={1}>
                            <QrReader
                                constraints={{
                                    height: 200,
                                    facingMode: 'environment',
                                }}
                                onResult={handleScan}
                            />
                        </Col>
                        <Col numColSpan={1} />
                    </Grid>
                </Card>
            </div>
        </div>
    )
}

export default WorkerHome
