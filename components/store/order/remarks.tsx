import useAxios from '@/common/axios'
import {
    BackendGeneralResponse,
    OrderItem,
    OrderResponse,
    RemarkItem,
} from '@/common/types'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import {
    Text,
    Card,
    Col,
    Divider,
    Flex,
    Grid,
    Select,
    TextInput,
    Title,
    SelectItem,
    Button,
    SearchSelect,
    SearchSelectItem,
} from '@tremor/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

type OrderRemarksType = {
    order: OrderResponse
}

type RemarksAllowedType = 'color' | 'brand' | 'texture'

const colors: string[] = [
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'White',
    'Black',
    'Purple',
    'Voilet',
    'Pink',
    'Magenta',
    'Peach',
    'Off White',
    'Beige ',
    'Khaki',
    'Ivory',
    'Brown',
    'Orange',
    'Grey',
    'Sandal',
]

const textures: string[] = [
    'Silky',
    'Cross pattern',
    'Stripped',
    'Checked',
    'Embroidery',
    'Words',
    'Cross stripped',
    'Dots',
    'Waves',
    'Printed',
    'Flowers',
    'Images',
    'Self checked',
    'Self stripped',
]

const OrderRemarks = ({ order }: OrderRemarksType) => {
    const axios = useAxios()
    const router = useRouter()

    const storeID = router.query.store

    const [loading, setLoading] = useState<boolean>(false)
    const [remarks, setRemarks] = useState<RemarkItem[]>(
        order.data?.remarks as RemarkItem[],
    )

    const handleRemarksChange = async (
        item: OrderItem,
        type: RemarksAllowedType,
        value: string,
    ) => {
        setRemarks((prevRemarks) => {
            const updatedRemarks = [...prevRemarks]
            const itemIndex = updatedRemarks.findIndex(
                (remark) => remark.item_id === item.id,
            )

            if (itemIndex !== -1) {
                updatedRemarks[itemIndex] = {
                    ...updatedRemarks[itemIndex],
                    [type]: value,
                }
            } else {
                updatedRemarks.push({
                    item_id: item.id,
                    color: type === 'color' ? value : '',
                    texture: type === 'texture' ? value : '',
                    brand: type === 'brand' ? value : '',
                })
            }

            return updatedRemarks
        })
    }

    const handleRemarksUpdate = async () => {
        setLoading(true)
        await axios.put<BackendGeneralResponse>(
            '/stores/' + storeID + '/orders/' + order.data.code + '/remarks',
            {
                remarks,
            },
        )

        alert('remarks updated')
        setLoading(false)
        router.reload()
    }

    const getRemarkForItem = (item: OrderItem, type: RemarksAllowedType) => {
        const theRemark = remarks?.filter(
            (remark) => remark.item_id == item.id,
        )[0]

        if (theRemark) {
            return theRemark[type]
        }

        return ''
    }

    return (
        <Card>
            <Title>Remarks</Title>

            {order.data.items?.map((item) => (
                <div className="mt-6" key={item.id}>
                    <Title className="mb-2">
                        {item.garment.name} - {item.service.service}
                    </Title>
                    <Grid numItemsLg={3} className="gap-6">
                        <Col>
                            <Text>{item.garment.name} color</Text>
                            <SearchSelect
                                className="mt-2"
                                onValueChange={(v) =>
                                    handleRemarksChange(item, 'color', v)
                                }
                                disabled={
                                    loading || !!order.data.delivery_challan_id
                                }
                                defaultValue={getRemarkForItem(item, 'color')}
                            >
                                {colors.map((color) => (
                                    <SearchSelectItem key={color} value={color}>
                                        {color}
                                    </SearchSelectItem>
                                ))}
                            </SearchSelect>
                        </Col>

                        <Col>
                            <Text>{item.garment.name} texture</Text>
                            <SearchSelect
                                className="mt-2"
                                onValueChange={(v) =>
                                    handleRemarksChange(item, 'texture', v)
                                }
                                disabled={
                                    loading || !!order.data.delivery_challan_id
                                }
                                defaultValue={getRemarkForItem(item, 'texture')}
                            >
                                {textures.map((texture) => (
                                    <SearchSelectItem
                                        key={texture}
                                        value={texture}
                                    >
                                        {texture}
                                    </SearchSelectItem>
                                ))}
                            </SearchSelect>
                        </Col>

                        <Col>
                            <Text>{item.garment.name} brand</Text>
                            <TextInput
                                className="mt-2"
                                onInput={(e) =>
                                    handleRemarksChange(
                                        item,
                                        'brand',
                                        e.currentTarget.value,
                                    )
                                }
                                disabled={
                                    loading || !!order.data.delivery_challan_id
                                }
                                defaultValue={getRemarkForItem(item, 'brand')}
                            />
                        </Col>
                    </Grid>

                    <Divider />
                </div>
            ))}

            <Flex justifyContent="end">
                <Button
                    icon={PencilSquareIcon}
                    variant="secondary"
                    loading={loading}
                    loadingText="Updating remarks..."
                    onClick={(e) => handleRemarksUpdate()}
                >
                    Update remarks
                </Button>
            </Flex>
        </Card>
    )
}

export default OrderRemarks
