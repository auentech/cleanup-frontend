import { Skeleton } from "@nextui-org/react"
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"

type TableSkeletonProps = {
    numRows?: number
    numCols?: number
}

const TableSkeleton = ({ numRows = 1, numCols = 1 }: TableSkeletonProps) => {
    const generateTableHead = () => {
        let tableHeaders = []

        for (let i = 0; i < numCols; i++) {
            tableHeaders.push(
                <TableHeaderCell key={'head-' + i}>
                    <Skeleton className="w-full h-3 rounded-lg" />
                </TableHeaderCell>
            )
        }

        return tableHeaders
    }

    const generateTableCells = () => {
        let tableCells: JSX.Element[][] = []

        for (let i = 0; i < numRows; i++) {
            tableCells[i] = []
            for (let j = 0; j < numCols; j++) {
                tableCells[i].push(
                    <TableCell key={`${i}-${j}`}>
                        <Skeleton className="w-3/4 h-3 rounded-lg" />
                    </TableCell>
                )
            }
        }

        return tableCells
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {generateTableHead()}
                </TableRow>
            </TableHead>
            <TableBody>
                {generateTableCells().map((cells, index) => (
                    <TableRow key={index}>
                        {cells}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default TableSkeleton
