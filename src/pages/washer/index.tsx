import isUser from "@/common/middlewares/isUser"
import WorkerHome from "@/components/worker-home"

const WasherHome = () => {
    return <WorkerHome role='washer' />
}

export default isUser(WasherHome, ['washer'])
