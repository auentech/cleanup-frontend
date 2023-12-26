import useAxios from '@/common/axios'
import { BackendGeneralResponse, Store, StoresResponse } from '@/common/types'
import { BuildingStorefrontIcon, TruckIcon } from '@heroicons/react/24/outline'
import {
    Grid,
    Col,
    TextInput,
    Text,
    Button,
    List,
    ListItem,
    Callout,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    NumberInput,
    Flex,
} from '@tremor/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { QrReader } from 'react-qr-reader'

const CreateReturn = () => {
    const axios = useAxios()
    const router = useRouter()

    const [codes, setCodes] = useState<string[]>([])
    const [stores, setStores] = useState<StoresResponse>()
    const [loading, setLoading] = useState<boolean>(false)

    const [search, setSearch] = useState<string>()
    const [store, setStore] = useState<Store>()

    const handleScan = (result: any, error: any) => {
        if (typeof result?.text == 'string') {
            setCodes((oldCodes) => {
                if (oldCodes.includes(result.text)) {
                    return oldCodes
                }

                return [...oldCodes, result.text]
            })
        }
    }

    const handleCreateRC = async () => {
        setLoading(true)

        const data = codes.map((code) => {
            const bagCount = (
                document.getElementById(code + '-bags') as HTMLInputElement
            ).value
            return {
                order_code: code,
                bags: parseInt(bagCount),
            }
        })

        const res = await axios.post<BackendGeneralResponse>(
            '/return-challans',
            {
                store_id: store?.id,
                items: data,
            },
        )

        setLoading(false)
        alert(res.data.message)
        router.reload()
    }

    useEffect(() => {
        const fetchData = async () => {
            const storesResponse = await axios.get<StoresResponse>(
                'search/store',
                {
                    params: { search },
                },
            )

            setStores(storesResponse.data)
        }

        fetchData()
    }, [search])

    return (
        <>
            {store !== undefined && (
                <Grid numItemsLg={3} className="mt-6">
                    <Col numColSpan={1} />
                    <Col numColSpan={1}>
                        <QrReader
                            constraints={{
                                height: 200,
                                facingMode: 'environment',
                            }}
                            onResult={handleScan}
                        />
                    </Col>
                    <Col numColSpan={1} />
                </Grid>
            )}

            {stores && store == undefined && (
                <>
                    <div className="mt-4">
                        <Text>Search store</Text>
                        <TextInput
                            placeholder="Search..."
                            className="mt-2"
                            onInput={(e) => setSearch(e.currentTarget.value)}
                        />
                    </div>
                    <List className="mt-4">
                        {stores.data.map((store) => (
                            <ListItem key={store.id}>
                                <Text>
                                    {store.code} - {store.name} -{' '}
                                    {store.profile?.state.name} -{' '}
                                    {store.profile?.district.name}
                                </Text>
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    color="gray"
                                    icon={BuildingStorefrontIcon}
                                    onClick={() => setStore(store)}
                                >
                                    Select store
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}

            {store !== undefined && (
                <Callout title={store.name + ' store selected'}>
                    All scanned orders will be sent to {store.name} -{' '}
                    {store.code}
                </Callout>
            )}

            {codes.length > 0 && (
                <>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>S.No</TableHeaderCell>
                                <TableHeaderCell>Order Code</TableHeaderCell>
                                <TableHeaderCell>Bags</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {codes.map((code, index) => (
                                <TableRow key={code}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{code}</TableCell>
                                    <TableCell>
                                        <NumberInput
                                            min={1}
                                            id={code + '-bags'}
                                            defaultValue={1}
                                            enableStepper={false}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Flex justifyContent="end">
                        <Button
                            icon={TruckIcon}
                            loading={loading}
                            loadingText="Creating challan..."
                            onClick={handleCreateRC}
                        >
                            Create Return Challan
                        </Button>
                    </Flex>
                </>
            )}
        </>
    )
}

export default CreateReturn
