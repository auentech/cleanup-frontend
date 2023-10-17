import { Title, Card, Grid, Col, Text } from "@tremor/react"
import { QrReader } from "react-qr-reader"
import useAxios from "@/common/axios"
import { UserData } from "@/common/types"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

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

        (async () => {
            const response = await axios.post('/orders/' + code + '/status', {
                action
            })

            router.reload()
        })()
    }, [code])

    return (
        <div className="p-12">
            <Title>Welcome {user.name}</Title>
            <Text>Ready to update some orders?</Text>

            <div className="mt-6">
                <Card>
                    <Title>Order scanner</Title>
                    <Text>Time to change the order status</Text>
                    <Grid numItemsLg={3} className="mt-6">
                        <Col numColSpan={1} />
                        <Col numColSpan={1}>
                            <QrReader constraints={{ height: 200 }} onResult={handleScan} />
                        </Col>
                        <Col numColSpan={1} />
                    </Grid>
                </Card>
            </div>
        </div>
    )
}

export default WorkerHome
