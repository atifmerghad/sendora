import { createSystem, defaultConfig } from '@chakra-ui/react';

const customTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: '#F5F0F6' },
          100: { value: '#E8DCE9' },
          200: { value: '#D1B9D3' },
          300: { value: '#BA96BD' },
          400: { value: '#A373A7' },
          500: { value: '#8C5091' },
          600: { value: '#6F3F73' },
          700: { value: '#522E55' },
          800: { value: '#351D37' },
          900: { value: '#28112B' },
          950: { value: '#1A0B1C' },
        },
        secondary: {
          50: { value: '#F3E5F5' },
          100: { value: '#E1BEE7' },
          200: { value: '#CE93D8' },
          300: { value: '#BA68C8' },
          400: { value: '#AB47BC' },
          500: { value: '#9C27B0' },
          600: { value: '#8E24AA' },
          700: { value: '#7B1FA2' },
          800: { value: '#6A1B9A' },
          900: { value: '#4A148C' },
          950: { value: '#38006B' },
        },
        accent: {
          50: { value: '#FFF3E0' },
          100: { value: '#FFE0B2' },
          200: { value: '#FFCC80' },
          300: { value: '#FFB74D' },
          400: { value: '#FFA726' },
          500: { value: '#FF9800' },
          600: { value: '#FB8C00' },
          700: { value: '#F57C00' },
          800: { value: '#EF6C00' },
          900: { value: '#E65100' },
          950: { value: '#BF360C' },
        },
        // Map blue to primary color so existing components using blue.* will use primary
        blue: {
          50: { value: '#F5F0F6' },
          100: { value: '#E8DCE9' },
          200: { value: '#D1B9D3' },
          300: { value: '#BA96BD' },
          400: { value: '#A373A7' },
          500: { value: '#8C5091' },
          600: { value: '#6F3F73' },
          700: { value: '#522E55' },
          800: { value: '#351D37' },
          900: { value: '#28112B' },
          950: { value: '#1A0B1C' },
        },
      },
    },
    semanticTokens: {
      colors: {
        'primary.50': {
          value: {
            base: '{colors.primary.50}',
            _dark: '{colors.primary.950}',
          },
        },
        'primary.100': {
          value: {
            base: '{colors.primary.100}',
            _dark: '{colors.primary.900}',
          },
        },
        'primary.200': {
          value: {
            base: '{colors.primary.200}',
            _dark: '{colors.primary.800}',
          },
        },
        'primary.300': {
          value: {
            base: '{colors.primary.300}',
            _dark: '{colors.primary.700}',
          },
        },
        'primary.400': {
          value: {
            base: '{colors.primary.400}',
            _dark: '{colors.primary.600}',
          },
        },
        'primary.500': {
          value: {
            base: '{colors.primary.500}',
            _dark: '{colors.primary.500}',
          },
        },
        'primary.600': {
          value: {
            base: '{colors.primary.600}',
            _dark: '{colors.primary.400}',
          },
        },
        'primary.700': {
          value: {
            base: '{colors.primary.700}',
            _dark: '{colors.primary.300}',
          },
        },
        'primary.800': {
          value: {
            base: '{colors.primary.800}',
            _dark: '{colors.primary.200}',
          },
        },
        'primary.900': {
          value: {
            base: '{colors.primary.900}',
            _dark: '{colors.primary.100}',
          },
        },
        'primary.950': {
          value: {
            base: '{colors.primary.950}',
            _dark: '{colors.primary.50}',
          },
        },
        'secondary.50': {
          value: {
            base: '{colors.secondary.50}',
            _dark: '{colors.secondary.950}',
          },
        },
        'secondary.100': {
          value: {
            base: '{colors.secondary.100}',
            _dark: '{colors.secondary.900}',
          },
        },
        'secondary.200': {
          value: {
            base: '{colors.secondary.200}',
            _dark: '{colors.secondary.800}',
          },
        },
        'secondary.300': {
          value: {
            base: '{colors.secondary.300}',
            _dark: '{colors.secondary.700}',
          },
        },
        'secondary.400': {
          value: {
            base: '{colors.secondary.400}',
            _dark: '{colors.secondary.600}',
          },
        },
        'secondary.500': {
          value: {
            base: '{colors.secondary.500}',
            _dark: '{colors.secondary.500}',
          },
        },
        'secondary.600': {
          value: {
            base: '{colors.secondary.600}',
            _dark: '{colors.secondary.400}',
          },
        },
        'secondary.700': {
          value: {
            base: '{colors.secondary.700}',
            _dark: '{colors.secondary.300}',
          },
        },
        'secondary.800': {
          value: {
            base: '{colors.secondary.800}',
            _dark: '{colors.secondary.200}',
          },
        },
        'secondary.900': {
          value: {
            base: '{colors.secondary.900}',
            _dark: '{colors.secondary.100}',
          },
        },
        'accent.50': {
          value: {
            base: '{colors.accent.50}',
            _dark: '{colors.accent.950}',
          },
        },
        'accent.100': {
          value: {
            base: '{colors.accent.100}',
            _dark: '{colors.accent.900}',
          },
        },
        'accent.200': {
          value: {
            base: '{colors.accent.200}',
            _dark: '{colors.accent.800}',
          },
        },
        'accent.300': {
          value: {
            base: '{colors.accent.300}',
            _dark: '{colors.accent.700}',
          },
        },
        'accent.400': {
          value: {
            base: '{colors.accent.400}',
            _dark: '{colors.accent.600}',
          },
        },
        'accent.500': {
          value: {
            base: '{colors.accent.500}',
            _dark: '{colors.accent.500}',
          },
        },
        'accent.600': {
          value: {
            base: '{colors.accent.600}',
            _dark: '{colors.accent.400}',
          },
        },
        'accent.700': {
          value: {
            base: '{colors.accent.700}',
            _dark: '{colors.accent.300}',
          },
        },
        'accent.800': {
          value: {
            base: '{colors.accent.800}',
            _dark: '{colors.accent.200}',
          },
        },
        'accent.900': {
          value: {
            base: '{colors.accent.900}',
            _dark: '{colors.accent.100}',
          },
        },
      },
    },
  },
  globalCss: {
    'button[data-part="root"]:not([data-color-scheme]):not([data-variant="ghost"]):not([data-variant="link"])': {
      bg: '{colors.primary.600}',
      color: 'white',
      _hover: {
        bg: '{colors.primary.700}',
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      },
      _active: {
        bg: '{colors.primary.800}',
        transform: 'translateY(0)',
      },
      _focus: {
        boxShadow: '0 0 0 3px {colors.primary.200}',
      },
      transition: 'all 0.2s',
      fontWeight: 'semibold',
    },
    'button[data-variant="outline"]:not([data-color-scheme])': {
      borderColor: '{colors.primary.600}',
      color: '{colors.primary.600}',
      _hover: {
        bg: '{colors.primary.50}',
        borderColor: '{colors.primary.700}',
        color: '{colors.primary.700}',
      },
      _active: {
        bg: '{colors.primary.100}',
        borderColor: '{colors.primary.800}',
        color: '{colors.primary.800}',
      },
    },
  },
});

export default customTheme;
