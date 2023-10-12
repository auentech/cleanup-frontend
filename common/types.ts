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
    }
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

type Store = {
    id: number
    code: string
    name: string
    profile: Profile
    created_at: string
    updated_at: string
}

export type StatusEnum = 'received' | 'in_process' | 'processed' | 'in_store' | 'delivered'

type Order = {
    id: number
    code: string
    count: number
    cost: number
    discount: number
    status: StatusEnum
    customer?: UserData
    created_at: Date
    updated_at: Date
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

export type BackendGeneralResponse = {
    type: string
    message: string
}
