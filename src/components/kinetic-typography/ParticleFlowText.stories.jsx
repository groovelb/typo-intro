import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ParticleFlowText from './ParticleFlowText';

export default {
  title: 'Interactive/11. KineticTypography/ParticleFlowText',
  component: ParticleFlowText,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    text: {
      control: 'text',
      description: '파티클로 렌더링할 텍스트',
    },
    particleCount: {
      control: { type: 'number', min: 1000, max: 50000, step: 1000 },
      description: '파티클 개수',
    },
    fontSize: {
      control: { type: 'number', min: 5, max: 40, step: 1 },
      description: '텍스트 지오메트리 크기 (Three.js unit)',
    },
    speed: {
      control: { type: 'number', min: 0.05, max: 0.6, step: 0.05 },
      description: '라이프사이클 진행 속도',
    },
    colorStart: {
      control: 'color',
      description: '진입 색상',
    },
    colorEnd: {
      control: 'color',
      description: '종료 색상',
    },
    backgroundColor: {
      control: 'color',
      description: '캔버스 배경색',
    },
    hasZoomControl: {
      control: 'boolean',
      description: '마우스 휠 줌 활성화',
    },
    hasMouseTilt: {
      control: 'boolean',
      description: '마우스 위치에 따른 3D 틸트 반응',
    },
    tiltStrength: {
      control: { type: 'number', min: 0, max: 1, step: 0.05 },
      description: '틸트 최대 각도 (라디안)',
    },
  },
};

/** 풀스크린 캔버스 데모용 래퍼 */
const StageBox = ({ children, sx = {} }) => (
  <Box sx={ { width: '100%', height: '100vh', ...sx } }>{ children }</Box>
);

/**
 * 디자인 시스템 토큰 (theme.palette 매핑)
 * - INK: text.primary base — rgb(15, 10, 31), violet-tilted black
 * - INK_SECONDARY: text.secondary base — 동일 hue, 약한 톤
 * - BG_DEFAULT: background.default — #FBFAFE
 * Three.js Color는 hex 문자열만 받으므로 알파 없는 base hex로 전달
 */
const INK = '#0F0A1F';
const INK_SECONDARY = '#3D3949';
const BG_DEFAULT = '#FBFAFE';

export const Default = {
  args: {
    text: 'DDD',
    particleCount: 45000,
    fontSize: 9,
    colorStart: INK,
    colorEnd: INK_SECONDARY,
    backgroundColor: BG_DEFAULT,
    speed: 0.15,
    hasZoomControl: false,
    hasMouseTilt: true,
    tiltStrength: 0.35,
  },
  render: (args) => (
    <StageBox>
      <ParticleFlowText { ...args } />
    </StageBox>
  ),
};

/** 디자인 시스템 잉크 톤 — 강조 글자 */
export const Monochrome = {
  render: () => (
    <StageBox>
      <ParticleFlowText
        text="VIBE"
        particleCount={ 22000 }
        fontSize={ 18 }
        colorStart={ INK }
        colorEnd={ INK_SECONDARY }
        backgroundColor={ BG_DEFAULT }
      />
    </StageBox>
  ),
};

/** 다크 반전 — 잉크 배경에 종이 톤 파티클 */
export const InvertedInk = {
  render: () => (
    <StageBox>
      <ParticleFlowText
        text="DESIGN"
        particleCount={ 20000 }
        fontSize={ 14 }
        colorStart={ BG_DEFAULT }
        colorEnd="#9E99AA"
        backgroundColor={ INK }
      />
    </StageBox>
  ),
};

/** 저밀도 — 성능/스타일 비교용 */
export const LowDensity = {
  render: () => (
    <StageBox>
      <ParticleFlowText
        text="MINIMAL"
        particleCount={ 6000 }
        fontSize={ 14 }
        colorStart={ INK }
        colorEnd={ INK_SECONDARY }
        backgroundColor={ BG_DEFAULT }
        speed={ 0.2 }
      />
    </StageBox>
  ),
};

/** 텍스트 변경 인터랙션 */
const TextSwitchDemo = () => {
  const phrases = ['HELLO', 'WORLD', 'PARTICLE', 'FLOW'];
  const [index, setIndex] = useState(0);

  return (
    <Box sx={ { position: 'relative', width: '100%', height: '100vh' } }>
      <ParticleFlowText
        key={ phrases[index] }
        text={ phrases[index] }
        particleCount={ 22000 }
        fontSize={ 16 }
        colorStart={ INK }
        colorEnd={ INK_SECONDARY }
        backgroundColor={ BG_DEFAULT }
      />
      <Box
        sx={ {
          position: 'absolute',
          top: 24,
          left: 24,
          display: 'flex',
          gap: 1,
          zIndex: 1,
        } }
      >
        { phrases.map((phrase, i) => (
          <Button
            key={ phrase }
            size="small"
            variant={ i === index ? 'contained' : 'outlined' }
            onClick={ () => setIndex(i) }
          >
            { phrase }
          </Button>
        )) }
      </Box>
      <Typography
        variant="caption"
        sx={ {
          position: 'absolute',
          bottom: 24,
          left: 24,
          color: 'text.secondary',
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
        } }
      >
        CLICK A WORD TO REGENERATE PARTICLES
      </Typography>
    </Box>
  );
};

export const TextSwitch = {
  render: () => <TextSwitchDemo />,
};
