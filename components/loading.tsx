import { Flex } from '@tremor/react'
import { Waveform } from '@uiball/loaders'

const Loading = () => (
    <Flex alignItems="center" justifyContent="center">
        <Waveform size={20} color="#3b82f6" />
    </Flex>
)

export default Loading
