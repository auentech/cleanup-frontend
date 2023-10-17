import isUser from "@/common/middlewares/isUser"
import WorkerHome from "@/components/worker-home"

const PackerHome = () => {
    return <WorkerHome role='packer' />
}

export default isUser(PackerHome, ['packer'])
