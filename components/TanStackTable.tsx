'use client';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  Box,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';

interface TanStackTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  enableSorting?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

export function TanStackTable<T>({
  data,
  columns,
  enableSorting = true,
  enablePagination = false,
  pageSize = 10,
}: TanStackTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <Box overflowX="auto" w="100%">
      <TableRoot minW="100%">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableColumnHeader
                  key={header.id}
                  cursor={enableSorting && header.column.getCanSort() ? 'pointer' : 'default'}
                  onClick={header.column.getToggleSortingHandler()}
                  userSelect="none"
                  whiteSpace="nowrap"
                  px={4}
                  py={3}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {enableSorting && header.column.getCanSort() && (
                    <Box as="span" ml={2} fontSize="xs">
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? ' ↕'}
                    </Box>
                  )}
                </TableColumnHeader>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id}
                    px={4}
                    py={3}
                    maxW="300px"
                    overflowX="auto"
                    whiteSpace="nowrap"
                    sx={{
                      '&::-webkit-scrollbar': {
                        height: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'gray.300',
                        borderRadius: '3px',
                        _dark: { background: 'gray.600' },
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'gray.400',
                        _dark: { background: 'gray.500' },
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} textAlign="center" py={8}>
                <Text>No data available in table</Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Aucun élement existe
                </Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableRoot>
    </Box>
  );
}

