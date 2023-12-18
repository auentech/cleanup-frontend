const FormatNumber = (cost: number): string => {
    let result: string

    switch (true) {
        case cost >= 10000000:
            result = (cost / 10000000).toFixed(1) + ' Cr'
            break
        case cost >= 100000:
            result = (cost / 100000).toFixed(1) + ' Lakh'
            break
        case cost >= 1000000:
            result = (cost / 1000000).toFixed(1) + ' Million'
            break
        case cost >= 1000000000:
            result = (cost / 1000000000).toFixed(1) + ' Billion'
            break
        case cost >= 1000000000000:
            result = (cost / 1000000000000).toFixed(1) + ' Trillion'
            break
        case cost >= 1000:
            result = (cost / 1000).toFixed(1) + 'K'
            break
        default:
            result = cost.toFixed(2).toString()
    }

    return result
}

export default FormatNumber
