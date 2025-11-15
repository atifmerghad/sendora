'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import {
  Box,
  Input,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useColorModeValue } from '@/lib/useColorModeValue';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  placeholder?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  placeholder = 'Sélectionner une plage de dates',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  const range: DateRange | undefined = start && end ? { from: start, to: end } : start ? { from: start } : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const startStr = format(range.from, 'yyyy-MM-dd');
      const endStr = format(range.to, 'yyyy-MM-dd');
      onDateChange(startStr, endStr);
      setIsOpen(false);
    } else if (range?.from) {
      // If only start date is selected, wait for end date
      const startStr = format(range.from, 'yyyy-MM-dd');
      onDateChange(startStr, '');
    }
  };

  const displayText = start && end
    ? `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`
    : start
    ? `${format(start, 'dd/MM/yyyy')} - ...`
    : placeholder;

  return (
    <Box position="relative" width="100%">
      <Input
        value={displayText}
        readOnly
        placeholder={placeholder}
        size="sm"
        cursor="pointer"
        pr="40px"
        onClick={() => setIsOpen(true)}
      />
      <Box
        position="absolute"
        right="8px"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
      >
        <Calendar size={16} />
      </Box>
      {isOpen && (
        <>
          <Box
            position="absolute"
            top="100%"
            left={0}
            zIndex={1000}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            mt={1}
            p={4}
            boxShadow="xl"
            minW={{ base: '100%', md: '600px' }}
            maxW={{ base: 'calc(100vw - 2rem)', md: 'none' }}
          >
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              locale={fr}
              numberOfMonths={isMobile ? 1 : 2}
              className="rdp"
              styles={{
                root: {
                  fontFamily: 'inherit',
                },
                month: {
                  margin: '0 0.5rem',
                },
                caption: {
                  fontWeight: '600',
                  fontSize: '1rem',
                  padding: '0.5rem 0',
                },
                day: {
                  borderRadius: '0.375rem',
                  margin: '0.125rem',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                },
                day_selected: {
                  backgroundColor: '#6F3F73',
                  color: 'white',
                },
                day_range_start: {
                  backgroundColor: '#6F3F73',
                  color: 'white',
                },
                day_range_end: {
                  backgroundColor: '#6F3F73',
                  color: 'white',
                },
                day_range_middle: {
                  backgroundColor: '#E8DCE9',
                  color: '#28112B',
                },
              }}
            />
            {start && end && (
              <HStack justify="space-between" mt={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" color="gray.600">
                  {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => setIsOpen(false)}
                >
                  Fermer
                </Button>
              </HStack>
            )}
          </Box>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={999}
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </Box>
  );
}

