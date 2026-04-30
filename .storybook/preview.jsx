import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme } from '../src/styles/themes';

// Google Fonts 로드 (Material Symbols + 기본 폰트)
const googleFonts = [
  // Material Symbols
  'Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  // Default Theme Font
  'Outfit:wght@300;400;500;600;700;800;900',
];

googleFonts.forEach((font) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
  document.head.appendChild(link);
});

// 한글 가변 폰트 (Wanted Sans Variable + Pretendard Variable fallback)
const cdnFonts = [
  'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css',
];

cdnFonts.forEach((href) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
});

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: [
          'Overview',
          'Style',
          ['Overview', 'Colors', 'Typography', 'Icons', 'Spacing', 'Component Tokens'],
          'Component',
          [
            '1. Typography',
            '2. Container',
            '3. Card',
            '4. Media',
            '5. Data Display',
            '6. In-page Navigation',
            '7. Input & Control',
            '8. Layout',
            '9. Overlay & Feedback',
            '10. Navigation',
          ],
          'Interactive',
          ['12. Scroll'],
          'Common',
          'Template',
          'Test Data',
        ],
        method: 'alphabetical',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <div style={{ width: '100%', paddingTop: '40px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
