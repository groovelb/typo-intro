import { Box } from '@mui/material';
import ExpandableSentence from './ExpandableSentence';
import buildIntroSentence from './buildIntroSentence';

const INTRO_SENTENCE = buildIntroSentence();

export default {
  title: 'Custom Component/ExpandableSentence',
  component: ExpandableSentence,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    maxWidth: {
      control: { type: 'number', min: 320, max: 1600 },
      description: '컨테이너 최대 폭 (px). 부모/뷰포트 너비에 맞춰 100% 까지 자동 축소, ResizeObserver 가 실측값을 pretext 에 매번 전달',
    },
    fontSize: {
      control: { type: 'number', min: 14, max: 64 },
      description: '본문 폰트 사이즈 (px)',
    },
    lineHeight: {
      control: { type: 'number', min: 20, max: 96 },
      description: 'line-height (px)',
    },
    fontFamily: {
      control: 'text',
      description: '폰트 패밀리',
    },
    plainWeight: {
      control: { type: 'number', min: 100, max: 900, step: 100 },
      description: '평문 어절 font-weight',
    },
    keywordWeight: {
      control: { type: 'number', min: 100, max: 900, step: 100 },
      description: '키워드 어절 font-weight',
    },
    sentence: {
      control: 'object',
      description: '{ text, expansions: { 키워드: { text, expansions? } } } 트리',
    },
    charDelay: {
      control: { type: 'number', min: 10, max: 200 },
      description: '글자 사이 ms (typewriter 속도)',
    },
    isMuted: {
      control: 'boolean',
      description: '타이핑 사운드 음소거',
    },
    keyVolume: {
      control: { type: 'number', min: 0, max: 1, step: 0.05 },
      description: '키 사운드 볼륨 0~1',
    },
    letterSpacing: {
      control: { type: 'number', min: -5, max: 5, step: 0.1 },
      description: '자간 px (음수=좁힘)',
    },
    wordGapEm: {
      control: { type: 'number', min: 0.1, max: 1.5, step: 0.05 },
      description: '어절 간격 em (fontSize 곱)',
    },
    showMinimap: {
      control: 'boolean',
      description: '우상단 키워드 트리 미니맵 표시',
    },
    fontSizeClamp: {
      control: 'object',
      description: 'CSS clamp 반응형. { min, vw, max } — 예: { min: 22, vw: 3.5, max: 56 }',
    },
    lineHeightRatio: {
      control: { type: 'number', min: 1.1, max: 2.5, step: 0.05 },
      description: 'lineHeight = fontSize × ratio (lineHeight 없을 때)',
    },
  },
};

const SAMPLE = {
  text: '나는 [도구]를 다루는 사람이 아니라 [도구의 끝]에서 [움직이는] 사람이다.',
  expansions: {
    '도구': {
      text: '[CLI 플래그]와 [YOLO 모드]와 [하네스]',
      expansions: {
        'CLI 플래그': {
          text: '동사와 목적어로 묶인 작은 서브그룹',
        },
        'YOLO 모드': {
          text: '되돌리기 비용을 감수하는 [eager execution]',
          expansions: {
            'eager execution': { text: 'PreToolUse 훅과 권한 모드의 독립' },
          },
        },
        '하네스': {
          text: 'context engineering 의 다른 이름',
        },
      },
    },
    '도구의 끝': {
      text: '[자각]이 시작되는 자리',
      expansions: {
        '자각': {
          text: '[암묵지]가 결과로 드러나는 순간',
          expansions: {
            '암묵지': { text: '체화는 숙련의 부산물이다' },
          },
        },
      },
    },
    '움직이는': {
      text: '기다리지 않고 직접 [증명하는]',
      expansions: {
        '증명하는': { text: 'Design as Build' },
      },
    },
  },
};

const STAGE_BG = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'background.default',
  px: 4,
  py: 8,
};

export const Default = {
  args: {
    sentence: SAMPLE,
    maxWidth: 900,
    fontSize: 48,
    lineHeight: 91,
    fontFamily: '"Wanted Sans Variable", "Pretendard Variable", "Apple SD Gothic Neo", system-ui, sans-serif',
    plainWeight: 500,
    keywordWeight: 800,
    charDelay: 45,
    isMuted: false,
    keyVolume: 0.3,
    letterSpacing: -1.6,
    wordGapEm: 0.38,
    showMinimap: true,
  },
  render: (args) => (
    <Box sx={ STAGE_BG }>
      <ExpandableSentence { ...args } />
    </Box>
  ),
};

export const SelfIntro = {
  args: {
    sentence: INTRO_SENTENCE,
    maxWidth: 1100,
    fontSize: 40,
    lineHeight: 78,
    fontFamily: '"Wanted Sans Variable", "Pretendard Variable", "Apple SD Gothic Neo", system-ui, sans-serif',
    plainWeight: 500,
    keywordWeight: 800,
    charDelay: 35,
    isMuted: false,
    keyVolume: 0.3,
    letterSpacing: -1.4,
    wordGapEm: 0.38,
    showMinimap: true,
  },
  render: (args) => (
    <Box sx={ { ...STAGE_BG, alignItems: 'flex-start', pt: 12 } }>
      <ExpandableSentence { ...args } />
    </Box>
  ),
};

export const Responsive = {
  args: {
    sentence: INTRO_SENTENCE,
    maxWidth: 1100,
    fontSizeClamp: { min: 22, vw: 3.6, max: 56 },
    lineHeightRatio: 1.7,
    fontFamily: '"Wanted Sans Variable", "Pretendard Variable", "Apple SD Gothic Neo", system-ui, sans-serif',
    plainWeight: 500,
    keywordWeight: 800,
    charDelay: 35,
    isMuted: false,
    keyVolume: 0.3,
    letterSpacing: -1.4,
    wordGapEm: 0.38,
    showMinimap: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'fontSizeClamp = { min: 22, vw: 3.6, max: 56 } — 뷰포트 너비에 따라 fontSize 가 22~56px 범위로 부드럽게 보간됨. JS 로 같은 값 계산해 pretext 측정도 정확히 매칭.',
      },
    },
  },
  render: (args) => (
    <Box sx={ { ...STAGE_BG, alignItems: 'flex-start', pt: 12 } }>
      <ExpandableSentence { ...args } />
    </Box>
  ),
};

export const Identical = {
  args: {
    sentence: SAMPLE,
    maxWidth: 900,
    fontSize: 48,
    lineHeight: 91,
    fontFamily: '"Wanted Sans Variable", "Pretendard Variable", "Apple SD Gothic Neo", system-ui, sans-serif',
    plainWeight: 500,
    keywordWeight: 500,
    charDelay: 45,
    isMuted: false,
    keyVolume: 0.3,
    letterSpacing: -1.6,
    wordGapEm: 0.38,
    showMinimap: true,
  },
  render: (args) => (
    <Box sx={ STAGE_BG }>
      <ExpandableSentence { ...args } />
    </Box>
  ),
};

export const Large = {
  args: {
    sentence: SAMPLE,
    maxWidth: 1200,
    fontSize: 64,
    lineHeight: 120,
    fontFamily: '"Wanted Sans Variable", "Pretendard Variable", "Apple SD Gothic Neo", system-ui, sans-serif',
    plainWeight: 400,
    keywordWeight: 800,
    charDelay: 60,
    isMuted: false,
    keyVolume: 0.3,
    letterSpacing: -2,
    wordGapEm: 0.41,
    showMinimap: true,
  },
  render: (args) => (
    <Box sx={ STAGE_BG }>
      <ExpandableSentence { ...args } />
    </Box>
  ),
};
