/**
 * Default Theme — Paper & Ink
 *
 * 종이와 잉크를 컨셉으로 한 디자인 토큰.
 * 피그마의 Design Tokens / Variables와 동일한 역할입니다.
 *
 * ## 핵심 철학
 * - **Sharp Corners**: borderRadius 0 (날카로운 모서리)
 * - **Dimmed Shadow**: offset 없이 blur만 사용하는 은은한 그림자
 * - **Paper White**: 살짝 violet으로 틸트된 종이 흰색 (#FBFAFE)
 * - **Ink Black**: 살짝 violet으로 틸트된 잉크 검정 (#0F0A1F)
 */

import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// ============================================================
// 1. Color Tokens (색상 토큰)
// ============================================================
const palette = {
  mode: 'light',
  // 브랜드 색상
  // Primary = Ink (violet 틸트 잉크, 채도 강화)
  primary: {
    light: '#2A2240',
    main: '#110A26',
    dark: '#06031A',
    contrastText: '#F5F0FA',
  },
  // Secondary = Faded Violet Ink
  secondary: {
    light: '#6F6885',
    main: '#3E3559',
    dark: '#1F1A33',
    contrastText: '#F5F0FA',
  },

  // 상태 색상 (Feedback)
  error: {
    light: '#ef5350',
    main: '#d32f2f',
    dark: '#c62828',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#ff9800',
    main: '#ed6c02',
    dark: '#e65100',
    contrastText: '#FFFFFF',
  },
  success: {
    light: '#4caf50',
    main: '#2e7d32',
    dark: '#1b5e20',
    contrastText: '#FFFFFF',
  },
  info: {
    light: '#03a9f4',
    main: '#0288d1',
    dark: '#01579b',
    contrastText: '#FFFFFF',
  },

  // 텍스트 색상 (violet-tilted ink: rgb(17, 10, 38), 틴트 강화)
  text: {
    primary: 'rgba(17, 10, 38, 0.94)',
    secondary: 'rgba(17, 10, 38, 0.65)',
    disabled: 'rgba(17, 10, 38, 0.40)',
  },

  // 배경 색상 (Paper — violet 틸트 종이, 채도 강화)
  background: {
    default: '#F5F0FA',
    paper: '#F9F5FD',
  },

  // 구분선
  divider: 'rgba(17, 10, 38, 0.14)',

  // 액션 상태
  action: {
    active: 'rgba(17, 10, 38, 0.56)',
    hover: 'rgba(17, 10, 38, 0.05)',
    selected: 'rgba(17, 10, 38, 0.09)',
    disabled: 'rgba(17, 10, 38, 0.28)',
    disabledBackground: 'rgba(17, 10, 38, 0.14)',
    focus: 'rgba(17, 10, 38, 0.14)',
  },

  // Grey 스케일
  grey: {
    50: grey[50],
    100: grey[100],
    200: grey[200],
    300: grey[300],
    400: grey[400],
    500: grey[500],
    600: grey[600],
    700: grey[700],
    800: grey[800],
    900: grey[900],
  },
};

// ============================================================
// 2. Typography Tokens (타이포그래피 토큰)
// ============================================================
const typography = {
  // 기본 폰트 패밀리
  fontFamily: [
    '"Pretendard Variable"',
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    '"Helvetica Neue"',
    '"Segoe UI"',
    '"Apple SD Gothic Neo"',
    '"Noto Sans KR"',
    '"Malgun Gothic"',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    'sans-serif',
  ].join(','),

  // 헤딩 폰트 패밀리
  headingFontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',

  // 폰트 크기 기준
  fontSize: 14,
  htmlFontSize: 16,

  // 폰트 굵기
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  // 헤딩 스타일
  h1: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 900,
    fontSize: '2.5rem',      // 40px
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 900,
    fontSize: '2rem',        // 32px
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 800,
    fontSize: '1.75rem',     // 28px
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 700,
    fontSize: '1.5rem',      // 24px
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 700,
    fontSize: '1.25rem',     // 20px
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  h6: {
    fontFamily: '"Outfit", "Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: '1.125rem',    // 18px
    lineHeight: 1.4,
    letterSpacing: '0',
  },

  // 본문 스타일
  body1: {
    fontSize: '1rem',        // 16px
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    lineHeight: 1.6,
    letterSpacing: '0',
  },

  // 부제목
  subtitle1: {
    fontSize: '1rem',        // 16px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },

  // 기타
  button: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.02em',
    textTransform: 'none',   // 대문자 변환 비활성화
  },
  caption: {
    fontSize: '0.75rem',     // 12px
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 600,
    lineHeight: 2,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

// ============================================================
// 3. Spacing Token (간격 토큰)
// ============================================================
const spacing = 8; // 기본 단위: 8px

// ============================================================
// 4. Shape Token (모양 토큰)
// ============================================================
const shape = {
  borderRadius: 0, // Sharp corners (0px)
};

// ============================================================
// 5. Shadow Tokens (그림자 토큰)
// ============================================================
const customShadows = {
  none: 'none',
  sm: '0 0 12px rgba(15, 10, 31, 0.06)',
  md: '0 0 16px rgba(15, 10, 31, 0.08)',
  lg: '0 0 20px rgba(15, 10, 31, 0.10)',
  xl: '0 0 24px rgba(15, 10, 31, 0.12)',
};

// ============================================================
// 6. Breakpoints (브레이크포인트)
// ============================================================
const breakpoints = {
  values: {
    xs: 0,      // 모바일
    sm: 600,    // 태블릿 세로
    md: 900,    // 태블릿 가로
    lg: 1200,   // 데스크톱
    xl: 1536,   // 대형 데스크톱
  },
};

// ============================================================
// 7. Z-Index (레이어 순서)
// ============================================================
const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// ============================================================
// 8. Transitions (전환 효과)
// ============================================================
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// ============================================================
// 9. Component Overrides (컴포넌트 오버라이드)
// ============================================================
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: customShadows.lg,
      },
      elevation0: {
        boxShadow: customShadows.none,
      },
      elevation1: {
        boxShadow: customShadows.sm,
      },
      elevation2: {
        boxShadow: customShadows.md,
      },
      elevation3: {
        boxShadow: customShadows.lg,
      },
      elevation4: {
        boxShadow: customShadows.xl,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        textTransform: 'none',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },
};

// ============================================================
// Theme 생성
// ============================================================
const defaultTheme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
});

// 커스텀 속성 추가 (타입 확장 없이 접근 가능하도록)
defaultTheme.customShadows = customShadows;

/**
 * 대시보드 스타일 설정 (Default)
 */
defaultTheme.dashboard = {
  style: 'default',
  iconStyle: 'outlined',
  iconWeight: 400,
  cardBorderRadius: 0,
  cardColors: [
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
  ],
  subCardColors: [
    'linear-gradient(to bottom, #FAFAFA 0%, #FAFAFA 100%)',
    'linear-gradient(to bottom, #FAFAFA 0%, #FAFAFA 100%)',
    'linear-gradient(to bottom, #FAFAFA 0%, #FAFAFA 100%)',
    'linear-gradient(to bottom, #FAFAFA 0%, #FAFAFA 100%)',
    'linear-gradient(to bottom, #FAFAFA 0%, #FAFAFA 100%)',
    'linear-gradient(to bottom, #FAFAFA 0%, #FAFAFA 100%)',
  ],
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',
  border: '1px solid transparent',
  borderColor: 'transparent',
  shadow: customShadows.lg,
  subBorder: '1px solid rgba(0, 0, 0, 0.06)',
  subShadow: '0 0 0 rgba(0, 0, 0, 0)',
  subBackdropFilter: 'blur(0px)',
  subBorderRadius: 0,
  dividerColor: 'rgba(0, 0, 0, 0.12)',
  progressHeight: 6,
  progressTrackColor: 'rgba(0, 0, 0, 0.08)',
  progressBarColor: palette.primary.main,
  progressGradient: false,
  progressBorderRadius: 0,
  background: '#FFFFFF',
  atmosphere: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
  atmosphereOpacity: 0,
  accentColor: palette.primary.main,
  accentColors: {
    wind: '#4DB6AC',
    humidity: '#FFB74D',
    uvIndex: '#FF8A65',
    pressure: '#64B5F6',
  },
  blobs: null,
};

export default defaultTheme;

// 개별 토큰 내보내기 (문서화용)
export {
  palette,
  typography,
  spacing,
  shape,
  customShadows,
  breakpoints,
  zIndex,
  transitions,
  components,
};
