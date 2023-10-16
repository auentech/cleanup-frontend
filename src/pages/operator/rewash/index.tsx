import isUser from "@/common/middlewares/isUser"
import OperatorNavigation from "@/components/operator/operator-navigation"
import { Text, Title } from "@tremor/react"

const ListRewash = () => {
    return (
        <div className="p-12">
            <Title>Rewash</Title>
            <Text>Oh oh, customer not happy? Let's fix that</Text>

            <OperatorNavigation />
        </div>
    )
}

export default isUser(ListRewash, ['operator'])
