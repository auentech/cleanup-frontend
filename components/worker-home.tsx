import {
    Title,
    Card,
    Grid,
    Col,
    Text,
    Italic,
    Divider,
    TextInput,
    Button,
} from '@tremor/react'
import { QrReader } from 'react-qr-reader'
import useAxios from '@/common/axios'
import { BackendGeneralResponse, UserData } from '@/common/types'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Logout from '@/common/logout'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

type WorkerHomeType = {
    role: 'washer' | 'packer' | 'ironer'
}

const WorkerHome = ({ role }: WorkerHomeType) => {
    const axios = useAxios()
    const session = useSession()

    const user = session.data?.user as UserData
    const [code, setCode] = useState<string>()
    const [customCode, setCustomCode] = useState<string>()

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
        if (code == undefined || code == '') {
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

                toast.success(response.data.message)
            } catch (e) {
                const error = e as AxiosError
                const response = error.response?.data as BackendGeneralResponse

                toast.error(response?.message || 'Unable to update order')
            } finally {
                setCode('')
            }
        })()
    }, [code])

    const customSubmit = () => {
        setCode(customCode)
        setCustomCode('')
    }

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
                    <Divider />
                    <Grid
                        numItemsLg={12}
                        numItemsMd={12}
                        numItemsSm={12}
                        numItems={12}
                        className="gap-6"
                    >
                        <Col numColSpan={10}>
                            <TextInput
                                value={customCode}
                                onInput={(e) =>
                                    setCustomCode(e.currentTarget.value)
                                }
                                placeholder="Enter order code..."
                            />
                        </Col>
                        <Col numColSpan={2}>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={customSubmit}
                            >
                                Submit
                            </Button>
                        </Col>
                    </Grid>
                    <Grid numItemsLg={3} className="mt-2">
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
