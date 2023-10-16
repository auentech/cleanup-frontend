import useAxios from "@/common/axios"
import { BackendGeneralResponse, OrderResponse } from "@/common/types"
import { PencilIcon } from "@heroicons/react/24/outline"
import { Button, Card, Divider, Flex, Subtitle, TextInput, Title } from "@tremor/react"
import { useRouter } from "next/router"
import { useState } from "react"

type OrderRemarksType = {
    order: OrderResponse
}

const OrderRemarks = ({ order }: OrderRemarksType) => {
    const axios = useAxios()
    const router = useRouter()

    const storeID = router.query.store

    const [remarks, setRemarks] = useState<string>(order.data.remarks || '')
    const [showForm, setShowForm] = useState<boolean>(false)

    const handleRemarksEdit = async () => {
        await axios.put<BackendGeneralResponse>('/stores/' + storeID + '/orders/' + order.data.code, {
            remarks
        })

        router.reload()
    }

    return (
        <Card>
            <Title>Remarks</Title>
            {order.data.remarks && !showForm ? (
                <Subtitle>Remarks: {order.data.remarks}</Subtitle>
            ) : (
                <Subtitle>No remarks, why not add one?</Subtitle>
            )}

            {showForm && (
                <div className="mt-4">
                    <TextInput
                        value={remarks}
                        placeholder="Type your remarks"
                        onInput={e => setRemarks(e.currentTarget.value)}
                    />
                </div>
            )}

            <Divider />

            <Flex justifyContent="end">
                {showForm ? (
                    <Button icon={PencilIcon} variant="secondary" onClick={e => handleRemarksEdit()}>Submit remarks</Button>
                ) : (
                    <Button icon={PencilIcon} variant="secondary" onClick={e => setShowForm(true)}>Edit remarks</Button>
                )}
            </Flex>
        </Card>
    )
}

export default OrderRemarks
