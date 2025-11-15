'use client';

import { TableRoot, TableHeader, TableBody, TableRow, TableColumnHeader, TableCell } from '@chakra-ui/react';
import { forwardRef } from 'react';

// Re-export table components with v2-compatible names for easier migration
export const Table = forwardRef<any, any>((props, ref) => {
  // Remove variant prop as it's not supported in v3, but keep other props
  const { variant, ...restProps } = props;
  return <TableRoot ref={ref} {...restProps} />;
});

Table.displayName = 'Table';

export const Thead = TableHeader;
export const Tbody = TableBody;
export const Tr = TableRow;
export const Th = TableColumnHeader;
export const Td = TableCell;

