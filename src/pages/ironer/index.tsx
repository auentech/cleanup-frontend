import isUser from "@/common/middlewares/isUser"
import WorkerHome from "@/components/worker-home"

const IronerHome = () => {
    return <WorkerHome role='ironer' />
}

export default isUser(IronerHome, ['ironer'])
