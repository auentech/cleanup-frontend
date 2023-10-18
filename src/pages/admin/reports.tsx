import isUser from "@/common/middlewares/isUser"
import AdminNavigation from "@/components/admin/admin-navigation"
import { Text, Title } from "@tremor/react"

const AdminReports = () => {
    return (
        <div className="p-12">
            <Title>Business reports</Title>
            <Text>Want to get a rundown of your whole business?</Text>

            <AdminNavigation />
        </div>
    )
}

export default isUser(AdminReports, ['admin'])
