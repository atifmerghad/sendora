'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import { useColorModeValue } from '@/lib/useColorModeValue';

export function Card({ children, ...props }: BoxProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
      w="100%"
      {...props}
    >
      {children}
    </Box>
  );
}

