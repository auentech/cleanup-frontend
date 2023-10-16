type Geography = {
    id: number
    name: string
    created_at: Date
    updated_at: Date
}

type Profile = {
    id: number
    address: string
    pincode: number
    aadhaar?: number
    emergency_contact?: number
    state: Geography
    district: Geography
    created_at: Date
    updated_at: Date
}

export type UserData = {
    id: string
    name: string
    email: string
    phone: number
    role: 'admin' | 'operator' | 'washer' | 'ironer' | 'packer'
    profile?: Profile
    created_at: Date
    updated_at: Date
}

export type LoginResponse = {
    data: UserData
    meta: {
        token: string
        store_id?: number
    }
}

export type UserSearchResponse = {
    data: UserData[]
}

export type Role = 'admin' | 'operator' | 'washer' | 'packer' | 'ironer'

type Links = {
    first: string
    last: string
    prev: any
    next: any
}

type Meta = {
    current_page: number
    from: number
    last_page: number
    links: {
        url?: string
        label: string
        active: boolean
    }[]
    path: string
    per_page: number
    to: number
    total: number
}

type StoreOperator = {
    id: number
    user_id: number
    store_id: number
    user: UserData
    store: Store
    created_at: string
    updated_at: string
}

type Store = {
    id: number
    code: string
    name: string
    profile?: Profile
    operators?: StoreOperator[]
    created_at: string
    updated_at: string
}

export type StatusEnum = 'received' | 'in_process' | 'processed' | 'in_store' | 'delivered'

type Order = {
    id: number
    code: string
    count: number
    cost: number
    remarks?: string
    discount: number
    status: StatusEnum
    customer?: UserData
    items?: OrderItem[]
    rewash?: Order
    created_at: string
    updated_at: string
}

export type StoresResponse = {
    data: Store[],
    links: Links
    meta: Meta
}

type StoreMetrics = {
    ordersSevenDays: {
        [date: string]: Order[]
    }
}

export type StoreResponse = {
    data: Store
    metrics?: StoreMetrics
}

export type StatesResponse = {
    data: Geography[]
}

export type DistrictsResponse = {
    data: {
        districts: Geography[]
    } & Geography
}

export type FreeOperatorsResponse = {
    data: UserData[]
}

export type CreateStoreError = {
    errors: {
        operator?: string[]
        custom_code?: string[]
        name?: string[]
        'profile.address'?: string[]
        'profile.pincode'?: string[]
        'profile.district'?: string[]
        'profile.state'?: string[]
    }
}

export type OrdersResponse = {
    data: Order[],
    links: Links
    meta: Meta
}

export type Factory = {
    id: number
    code: string
    name: string
    created_at: string
    updated_at: string
    profile?: Profile
}

export type FactoriesResponse = {
    data: Factory[]
    links: Links
    meta: Meta
}

export type CreateFactoryError = {
    errors: {
        custom_code?: string[]
        name?: string[]
        'profile.address'?: string[]
        'profile.pincode'?: string[]
        'profile.district'?: string[]
        'profile.state'?: string[]
    }
}

export type UsersResponse = {
    data: UserData[]
    links: Links
    meta: Meta
}

export type CreateWorkerErrors = {
    errors: {
        name?: string[]
        email?: string[]
        password?: string[]
        phone?: string[]
        avatar?: string[]
        role?: string[]
        'profile.address'?: string[]
        'profile.pincode'?: string[]
        'profile.district'?: string[]
        'profile.state'?: string[]
        'profile.aadhaar'?: string[]
        'profile.emergency_contact'?: string[]
    }
}

export type OrderService = {
    id: number
    service: string
    created_at: string
    updated_at: string
    garments?: OrderGarment[]
}

export type OrderGarment = {
    id: number
    name: string
    price_min: number
    price_max: number
    created_at: string
    updated_at: string
}

type OrderItem = {
    id: number
    cost: number
    created_at: string
    updated_at: string
    service: OrderService
    garment: OrderGarment
}

export type OrderResponse = {
    data: Order
}

type OrderStatus = {
    id: number
    action: string
    performer?: UserData
    order_id: number
    created_at: string
    updated_at: string
}

export type OrderStatusesResponse = {
    data: OrderStatus[]
}

export type ServicesResponse = {
    data: OrderService[]
}

export type DeliveryChallan = {
    factory?: Factory
    code: string
    created_at: string
    updated_at: string
    id: number
    store?: Store
    orders?: Order[]
}

export type DeliveryChallansResponse = {
    data: DeliveryChallan[]
    meta: Meta
}

export type DeliveryChallanResponse = {
    data: DeliveryChallan
}

export type BackendGeneralResponse = {
    type: 'SUCCESS' | 'ERROR' | 'AUTH_ERROR'
    message: string
}
