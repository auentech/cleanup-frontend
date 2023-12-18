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
    role: Role
    token?: string
    store_id?: number
    profile?: Profile
    orders?: Order[]
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

export type Role =
    | 'admin'
    | 'manager'
    | 'operator'
    | 'washer'
    | 'packer'
    | 'ironer'
    | 'customer'

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

export type Store = {
    id: number
    code: string
    name: string
    profile?: Profile
    orders: Order[]
    operators?: StoreOperator[]
    created_at: string
    updated_at: string
}

export type StatusEnum =
    | 'received'
    | 'in_process'
    | 'processed'
    | 'in_store'
    | 'delivered'

export type RemarkItem = {
    item_id: number
    color: string
    texture: string
    brand: string
}

export type PaymentMode = 'UPI' | 'Card' | 'Cash'

export type Order = {
    id: number
    code: string
    count: number
    cost: number
    remarks?: RemarkItem[]
    mode: PaymentMode
    discount: number
    status: StatusEnum
    customer?: UserData
    items?: OrderItem[]
    store?: Store
    rewash?: Order
    paid: number
    speed: number
    delivery_challan_id: number
    rewash_parent_id: number
    due_date: string
    created_at: string
    updated_at: string
    package: 'economy' | 'executive'
}

export type StoresResponse = {
    data: Store[]
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
        'profile.emergency_contact'?: string[]
    }
}

export type OrdersResponse = {
    data: Order[]
    links: Links
    meta: Meta
}

export type Factory = {
    id: number
    code: string
    name: string
    created_at: string
    updated_at: string
    challans?: DeliveryChallan[]
    profile?: Profile
}

export type FactoriesResponse = {
    data: Factory[]
    links: Links
    meta: Meta
}

export type FactoryResponse = {
    data: Factory
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
    garments_count?: number
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

export type OrderItem = {
    id: number
    cost: number
    created_at: string
    updated_at: string
    service: OrderService
    garment: OrderGarment
}

export type OrderResponse = {
    data: Order
    meta?: {
        washedCount?: number
        ironedCount?: number
    }
}

type OrderStatus = {
    id: number
    data?: any
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

export type ServiceResponse = {
    data: OrderService
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

export type AdminDashboardResponse = {
    data: Order[]
    metrics: {
        [date: string]: {
            id: number
            cost: number
            paid: number
            discount: number
            created_at: string
        }[]
    }
}

type ReturnChallanOrder = {
    code: string
    bags: number
}

export type ReturnChallan = {
    id: number
    code: string
    store?: Store
    store_id: number
    created_at: string
    updated_at: string
    orders: ReturnChallanOrder[]
}

export type ReturnChallansResponse = {
    data: ReturnChallan[]
    links: Links
    meta: Meta
}

export type ClosingCreateResponse = {
    mode: PaymentMode
    total_cost: number
    created_at: string
}

export type Closing = {
    card: number
    cash: number
    upi: number
    expense: number
    remarks: string
    performer: UserData
    created_at: string
}

export type ClosingsResponse = {
    data: Closing[]
    links: Links
    meta: Meta
}

export type BackendGeneralResponse = {
    type: 'SUCCESS' | 'ERROR' | 'AUTH_ERROR'
    message: string
}
