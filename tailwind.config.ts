import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode:
    [
      'class',
    ],
  content:
    [
      './entrypoints/**/*.{ts,tsx,html}',
      './modules/**/*.{ts,tsx}',
      './content-script-ui/**/*.{ts,tsx}',
    ],
  theme:
    {
      extend:
        {
          transitionProperty:
            {
              height:
                'height',
            },
          animation:
            {
              spinner:
                'spinner 1s linear infinite',
              'spin-fast':
                'spin 0.5s linear infinite',
              'accordion-down':
                'accordion-down 0.2s ease-out',
              'accordion-up':
                'accordion-up 0.2s ease-out',
            },
          width:
            {
              floater:
                '222px',
              'care-center':
                '365px',
              'care-center-peek':
                '45px',
            },
          boxShadow:
            {
              'floater-body':
                'inset -2px -2px 10px 1px rgba(0, 0, 0, 0.5)',
              'floater-header':
                'inset 0px 0px 5px 1px rgba(0, 0, 0, 0.5)',
              'left-blue':
                '-15px 0 30px -10px rgba(173,216,230,0.9)',
              'entire-blue':
                'inset 0 0 30px 20px rgba(135,188,220,0.9)',
              'entire-blue-green':
                'inset 0 0 15px rgba(75,145,248,0.6)',
            },
          backdropBlur:
            {
              20: '20px',
            },
          keyframes:
            {
              spinner:
                {
                  '0%': {
                    opacity:
                      '1',
                  },
                  '10%':
                    {
                      opacity:
                        '0.7',
                    },
                  '20%':
                    {
                      opacity:
                        '0.3',
                    },
                  '35%':
                    {
                      opacity:
                        '0.2',
                    },
                  '50%':
                    {
                      opacity:
                        '0.1',
                    },
                  '75%':
                    {
                      opacity:
                        '0.05',
                    },
                  '100%':
                    {
                      opacity:
                        '0',
                    },
                },
              'accordion-down':
                {
                  from: {
                    height:
                      '0',
                  },
                  to: {
                    height:
                      'var(--radix-accordion-content-height)',
                  },
                },
              'accordion-up':
                {
                  from: {
                    height:
                      'var(--radix-accordion-content-height)',
                  },
                  to: {
                    height:
                      '0',
                  },
                },
            },
          fontSize:
            {
              lsm: '0.9375rem', // 15px - between text-sm (14px) and text-base (16px)
            },
          fontFamily:
            {
              sans: [
                'Google Sans Flex',
                'Inter',
                'system-ui',
                'sans-serif',
              ],
            },
          zIndex:
            {
              high: '2147483600',
              max: '2147483647',
            },
          borderRadius:
            {
              lg: 'var(--radius)',
              md: 'calc(var(--radius) - 2px)',
              sm: 'calc(var(--radius) - 4px)',
            },
          colors:
            {
              'marble-white':
                '#F5FAFB',
              'translucent-blue':
                'rgba(120,180,255,0.8)',
              background:
                'hsl(var(--background))',
              foreground:
                'hsl(var(--foreground))',
              card: {
                DEFAULT:
                  'hsl(var(--card))',
                foreground:
                  'hsl(var(--card-foreground))',
              },
              popover:
                {
                  DEFAULT:
                    'hsl(var(--popover))',
                  foreground:
                    'hsl(var(--popover-foreground))',
                },
              primary:
                {
                  DEFAULT:
                    '#004F58',
                  foreground:
                    'hsl(var(--primary-foreground))',
                  muted:
                    '#99CFD4'
                },
              secondary:
                {
                  DEFAULT:
                    '#4A6267',
                  foreground:
                    'hsl(var(--secondary-foreground))',
                },
              tertiary: 
                {
                  DEFAULT:
                    '#525E7D',
                  foreground:
                    'hsl(var(--tertiary-foreground))',
                },
              'blue-highlight':
                {
                  DEFAULT:
                    '#9EEFFD',
                },
              normal:
                {
                  DEFAULT:
                    '#4A6267',
                },
              muted:
                {
                  DEFAULT:
                    'hsl(var(--muted))',
                  foreground:
                    'hsl(var(--muted-foreground))',
                },
              accent:
                {
                  DEFAULT:
                    'hsl(var(--accent))',
                  foreground:
                    'hsl(var(--accent-foreground))',
                },
              destructive:
                {
                  DEFAULT:
                    'hsl(var(--destructive))',
                  foreground:
                    'hsl(var(--destructive-foreground))',
                },
              border:
                'hsl(var(--border))',
              input:
                'hsl(var(--input))',
              ring: 'hsl(var(--ring))',
              floater:
                {
                  DEFAULT:
                    'var(--floater)',
                  hover:
                    'var(--floater-hover)',
                },
              chart:
                {
                  1: 'hsl(var(--chart-1))',
                  2: 'hsl(var(--chart-2))',
                  3: 'hsl(var(--chart-3))',
                  4: 'hsl(var(--chart-4))',
                  5: 'hsl(var(--chart-5))',
                },
            },
        },
    },
  plugins:
    [
      animate,
    ],
};
