import useAxios from '@/common/axios'
import { BackendGeneralResponse, Store, StoresResponse } from '@/common/types'
import { BuildingStorefrontIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import { useDebounce } from 'use-debounce'
import Loading from './loading'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import Head from 'next/head'

const CreateReturn = () => {
    const axios = useAxios()
    const router = useRouter()

    const [codes, setCodes] = useState<string[]>([])
    const [store, setStore] = useState<Store>()

    const [page, setPage] = useState<number>(1)
    const [search, setSearch] = useState<string>('')
    const [debouncedSearch] = useDebounce(search, 300)

    const handleScan = (result: any, error: any) => {
        if (typeof result?.text == 'string') {
            setCodes((oldCodes) => {
                if (oldCodes.includes(result.text)) {
                    return oldCodes
                }

                toast.success(result.text + ' order added')
                return [...oldCodes, result.text]
            })
        }
    }

    const getStores = async (
        search: string = '',
        page: number = 1,
    ): Promise<StoresResponse> => {
        const endpoint =
            search == '' ? `/stores?page=${page}` : `/search/store?page=${page}`

        const response = await axios.get<StoresResponse>(endpoint, {
            params: { search, include: ['profile.state', 'profile.district'] },
        })

        return response.data as StoresResponse
    }

    const { data: stores, isLoading: isStoresLoading } = useQuery({
        queryKey: ['packer create rc', debouncedSearch, page],
        queryFn: () => getStores(debouncedSearch, page),
    })

    const createRC = useMutation({
        mutationFn: () => {
            const data = codes.map((code) => {
                const bagCount = (
                    document.getElementById(code + '-bags') as HTMLInputElement
                ).value
                return {
                    order_code: code,
                    bags: parseInt(bagCount),
                }
            })

            return axios.post<BackendGeneralResponse>('/return-challans', {
                store_id: store?.id,
                items: data,
            })
        },
        onError(error, variables, context) {
            if (isAxiosError(error)) {
                if (error.response) {
                    const res = error.response?.data as BackendGeneralResponse
                    toast.error(res.message)

                    return
                }

                toast.error('Server did not respond, retry!')
                return
            }

            toast.error('Unable to talk with server. Retry!')
        },
        onSuccess: () => {
            toast.success('Return challan created')
            setTimeout(() => router.reload(), 1000)
        },
    })

    return (
        <>
            <Head>
                <title key="title">Create RC | Cleanup</title>
            </Head>
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

            {store == undefined && (
                <div className="mt-4">
                    <Text>Search store</Text>
                    <TextInput
                        placeholder="Search..."
                        className="mt-2"
                        value={search}
                        onInput={(e) => setSearch(e.currentTarget.value)}
                    />
                </div>
            )}

            {isStoresLoading ? (
                <Loading />
            ) : (
                <>
                    <List className="mt-4">
                        {store != undefined
                            ? ''
                            : stores?.data.map((store) => (
                                  <ListItem key={store.id}>
                                      <Text>
                                          {store.code} - {store.name} -{' '}
                                          {store.profile?.state?.name} -{' '}
                                          {store.profile?.district?.name}
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
                            loading={createRC.isPending}
                            loadingText="Creating challan..."
                            onClick={() => createRC.mutate()}
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
