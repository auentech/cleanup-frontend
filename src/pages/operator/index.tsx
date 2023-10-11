import isUser from "@/common/middlewares/isUser"

const OperatorIndex = () => {
    return <h1>Operator page</h1>
}

export default isUser(OperatorIndex, ['operator'])
