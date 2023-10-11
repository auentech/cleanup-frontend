import isUser from "@/common/middlewares/isUser"

const AdminIndex = () => {
    return <h1>Admin page</h1>
}

export default isUser(AdminIndex, ['admin'])
