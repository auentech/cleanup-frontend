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

type Stores = {
    id: number
    code: string
    name: string
    profile: Profile
    created_at: string
    updated_at: string
}

export type StoresResponse = {
    data: Stores[],
    links: Links
    meta: Meta
}
