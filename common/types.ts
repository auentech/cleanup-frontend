type Geography = {
    id: number
    name: string
    created_at: Date
    updated_at: Date
}

type UserProfile = {
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

type UserData = {
    id: string
    name: string
    email: string
    phone: number
    role: 'admin' | 'operator' | 'washer' | 'ironer' | 'packer'
    profile?: UserProfile
    created_at: Date
    updated_at: Date
}

export type LoginResponse = {
    data: UserData
    meta: {
        token: string
    }
}
