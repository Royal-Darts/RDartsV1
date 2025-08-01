export interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any, index?: number) => React.ReactNode
}

export interface DataTableProps {
  data: any[]
  columns: Column[]
  title?: string
}
