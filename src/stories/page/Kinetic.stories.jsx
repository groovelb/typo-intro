import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RandomRevealText from '../../components/kinetic-typography/RandomRevealText';
import ScrambleText from '../../components/kinetic-typography/ScrambleText';
import ScrollRevealText from '../../components/kinetic-typography/ScrollRevealText';

export default {
  title: 'Page/Kinetic',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Kinetic — Interactive Page

오직 키네틱 타이포그래피만으로 구성된 인터랙티브 페이지.
디자인 토큰의 violet-tilted white / black만 사용한다.

### 인터랙션
- **Hero**: 마운트와 동시에 RandomReveal로 표제 등장
- **Cycler**: 단어 카드 클릭 시 다음 단어로 Scramble
- **Manifesto**: 스크롤에 따라 글자 단위 reveal
- **Grid**: 셀 hover 시 Scramble 트리거
        `,
      },
    },
  },
};

const HERO_WORDS = ['TYPOGRAPHY', 'KINETIC', 'MOTION', 'RHYTHM', 'CADENCE', 'SILENCE'];

const GRID_LABELS = [
  'WEIGHT', 'KERNING', 'TRACKING', 'LEADING',
  'X-HEIGHT', 'BASELINE', 'COUNTER', 'STROKE',
  'SERIF', 'GROTESK', 'DISPLAY', 'MONO',
];

const MANIFESTO =
  '글자는 정지된 형태가 아니다. 시간 위에 놓인 리듬이며, 호흡이고, 침묵이다. 우리는 글자가 어떻게 등장하는지, 어떻게 사라지는지, 그 사이의 간격이 어떤 의미를 만드는지 응시한다. 운동은 의미를 증폭시키고, 정적은 의미를 응축시킨다.';

/**
 * HeroSection 컴포넌트
 *
 * Props:
 * @param {number} wordIndex - 현재 표시 중인 hero 단어 인덱스 [Required]
 * @param {function} onAdvance - 다음 단어로 전환하는 핸들러 [Required]
 */
function HeroSection({ wordIndex, onAdvance }) {
  return (
    <Box
      onClick={ onAdvance }
      sx={ {
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        cursor: 'pointer',
        backgroundColor: 'background.default',
      } }
    >
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
        <RandomRevealText
          text="VIBE / 2026"
          variant="overline"
          delay={ 200 }
          stagger={ 50 }
          sx={ { color: 'text.primary', letterSpacing: '0.3em' } }
        />
        <RandomRevealText
          text="EXPERIMENT 01"
          variant="overline"
          delay={ 600 }
          stagger={ 50 }
          sx={ { color: 'text.secondary', letterSpacing: '0.3em' } }
        />
      </Box>

      <Box sx={ { textAlign: 'center', userSelect: 'none' } }>
        <ScrambleText
          text={ HERO_WORDS[wordIndex] }
          duration={ 700 }
          isInitialScramble
          variant="h1"
          sx={ {
            display: 'block',
            color: 'text.primary',
            fontSize: { xs: '20vw', md: '14vw' },
            lineHeight: 0.9,
            fontWeight: 900,
            letterSpacing: '-0.04em',
          } }
        />
        <Box sx={ { mt: { xs: 3, md: 5 } } }>
          <RandomRevealText
            text="— click anywhere to mutate —"
            variant="caption"
            delay={ 1400 }
            stagger={ 30 }
            sx={ { color: 'text.secondary', letterSpacing: '0.2em' } }
          />
        </Box>
      </Box>

      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' } }>
        <RandomRevealText
          text="ONLY BLACK · ONLY WHITE"
          variant="caption"
          delay={ 1000 }
          stagger={ 40 }
          sx={ { color: 'text.primary', letterSpacing: '0.25em' } }
        />
        <RandomRevealText
          text={ String(wordIndex + 1).padStart(2, '0') + ' / ' + String(HERO_WORDS.length).padStart(2, '0') }
          variant="caption"
          delay={ 1200 }
          stagger={ 40 }
          sx={ { color: 'text.primary', letterSpacing: '0.25em', fontVariantNumeric: 'tabular-nums' } }
        />
      </Box>
    </Box>
  );
}

/**
 * RuleSection 컴포넌트
 * 큰 글자 한 줄로 구획을 나누는 섹션 헤더
 *
 * Props:
 * @param {string} label - 섹션 라벨 [Required]
 * @param {string} index - 섹션 번호 [Required]
 */
function RuleSection({ label, index }) {
  return (
    <Box
      sx={ {
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'text.primary',
        px: { xs: 3, md: 6 },
        py: { xs: 3, md: 4 },
        display: 'flex',
        alignItems: 'baseline',
        gap: { xs: 2, md: 4 },
        backgroundColor: 'background.default',
      } }
    >
      <Typography
        variant="overline"
        sx={ { color: 'text.primary', letterSpacing: '0.25em', flexShrink: 0 } }
      >
        { index }
      </Typography>
      <ScrambleText
        text={ label }
        duration={ 900 }
        isInitialScramble
        variant="h3"
        sx={ {
          color: 'text.primary',
          fontWeight: 900,
          letterSpacing: '-0.01em',
          fontSize: { xs: '2rem', md: '3rem' },
        } }
      />
    </Box>
  );
}

/**
 * CyclerCard 컴포넌트
 * 클릭하면 단어가 다음 후보로 scramble되는 카드
 *
 * Props:
 * @param {string[]} candidates - 순환할 단어 배열 [Required]
 * @param {string} caption - 카드 캡션 [Required]
 */
function CyclerCard({ candidates, caption }) {
  const [index, setIndex] = useState(0);
  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % candidates.length);
  }, [candidates.length]);

  return (
    <Box
      onClick={ advance }
      sx={ {
        flex: 1,
        minHeight: { xs: 220, md: 320 },
        px: { xs: 3, md: 4 },
        py: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        backgroundColor: 'background.default',
        transition: 'background-color 0.4s ease',
        '&:hover': {
          backgroundColor: 'text.primary',
          color: 'background.default',
          '& *': { color: 'background.default !important' },
        },
        userSelect: 'none',
      } }
    >
      <Typography
        variant="overline"
        sx={ { color: 'text.secondary', letterSpacing: '0.25em' } }
      >
        { caption }
      </Typography>
      <ScrambleText
        text={ candidates[index] }
        duration={ 600 }
        variant="h2"
        sx={ {
          color: 'text.primary',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          fontSize: { xs: '3rem', md: '5rem' },
          lineHeight: 0.95,
          display: 'block',
        } }
      />
      <Typography
        variant="caption"
        sx={ {
          color: 'text.secondary',
          letterSpacing: '0.2em',
          fontVariantNumeric: 'tabular-nums',
        } }
      >
        { String(index + 1).padStart(2, '0') } / { String(candidates.length).padStart(2, '0') } — click to mutate
      </Typography>
    </Box>
  );
}

/**
 * CyclerGrid 컴포넌트
 * 두 개의 CyclerCard를 좌우로 배치
 */
function CyclerGrid() {
  return (
    <Box
      sx={ {
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        borderBottom: '1px solid',
        borderColor: 'text.primary',
        '& > *:first-of-type': {
          borderRight: { xs: 'none', md: '1px solid' },
          borderBottom: { xs: '1px solid', md: 'none' },
          borderColor: { xs: 'text.primary', md: 'text.primary' },
        },
      } }
    >
      <CyclerCard
        candidates={ ['STILLNESS', 'FLOW', 'PULSE', 'BREATH', 'ECHO'] }
        caption="MOOD"
      />
      <CyclerCard
        candidates={ ['SERIF', 'SANS', 'MONO', 'DISPLAY', 'SCRIPT'] }
        caption="FORM"
      />
    </Box>
  );
}

/**
 * ManifestoSection 컴포넌트
 * 스크롤에 따라 텍스트가 글자 단위로 reveal
 */
function ManifestoSection() {
  return (
    <Box
      sx={ {
        px: { xs: 3, md: 12 },
        py: { xs: 10, md: 20 },
        backgroundColor: 'background.default',
      } }
    >
      <Box sx={ { mb: { xs: 4, md: 8 } } }>
        <Typography
          variant="overline"
          sx={ { color: 'text.secondary', letterSpacing: '0.3em' } }
        >
          ※ MANIFESTO
        </Typography>
      </Box>
      <ScrollRevealText
        text={ MANIFESTO }
        activeColor="text.primary"
        inactiveColor="text.disabled"
        variant="h3"
        sx={ {
          maxWidth: '900px',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        } }
      />
    </Box>
  );
}

/**
 * MicroGridCell 컴포넌트
 *
 * Props:
 * @param {string} label - 셀 라벨 [Required]
 * @param {number} ordinal - 셀 순번 [Required]
 */
function MicroGridCell({ label, ordinal }) {
  const [hovered, setHovered] = useState(false);
  const [scrambleKey, setScrambleKey] = useState(0);

  const handleEnter = () => {
    setHovered(true);
    setScrambleKey((k) => k + 1);
  };

  return (
    <Box
      onMouseEnter={ handleEnter }
      onMouseLeave={ () => setHovered(false) }
      sx={ {
        position: 'relative',
        minHeight: { xs: 100, md: 140 },
        px: 2,
        py: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: hovered ? 'text.primary' : 'background.default',
        color: hovered ? 'background.default' : 'text.primary',
        transition: 'background-color 0.35s ease, color 0.35s ease',
        cursor: 'crosshair',
      } }
    >
      <Typography
        variant="caption"
        sx={ {
          color: 'inherit',
          opacity: 0.6,
          letterSpacing: '0.2em',
          fontVariantNumeric: 'tabular-nums',
        } }
      >
        { String(ordinal).padStart(2, '0') }
      </Typography>
      <ScrambleText
        key={ scrambleKey }
        text={ label }
        duration={ 400 }
        isInitialScramble
        variant="h6"
        sx={ {
          color: 'inherit',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          fontSize: { xs: '1rem', md: '1.25rem' },
        } }
      />
    </Box>
  );
}

/**
 * MicroGrid 컴포넌트
 * 4xN 그리드의 hover-scramble 셀 모음
 */
function MicroGrid() {
  return (
    <Box
      sx={ {
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        borderTop: '1px solid',
        borderColor: 'text.primary',
        '& > *': {
          borderRight: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'text.primary',
        },
        '& > *:nth-of-type(2n)': {
          borderRight: { xs: 'none', md: '1px solid' },
          borderColor: 'text.primary',
        },
        '& > *:nth-of-type(4n)': {
          borderRight: { xs: 'none', md: 'none' },
        },
      } }
    >
      { GRID_LABELS.map((label, i) => (
        <MicroGridCell key={ label } label={ label } ordinal={ i + 1 } />
      )) }
    </Box>
  );
}

/**
 * FooterSection 컴포넌트
 * 마무리 워드마크
 */
function FooterSection() {
  return (
    <Box
      sx={ {
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 14 },
        backgroundColor: 'text.primary',
        color: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 4, md: 8 },
      } }
    >
      <RandomRevealText
        text="END / OF / TRANSMISSION"
        variant="overline"
        delay={ 200 }
        stagger={ 60 }
        sx={ { color: 'background.default', letterSpacing: '0.3em' } }
      />
      <ScrambleText
        text="STAY KINETIC"
        duration={ 1200 }
        isInitialScramble
        variant="h1"
        sx={ {
          color: 'background.default',
          fontWeight: 900,
          fontSize: { xs: '14vw', md: '10vw' },
          lineHeight: 0.9,
          letterSpacing: '-0.03em',
        } }
      />
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 2 } }>
        <RandomRevealText
          text="VIBE DESIGN STARTERKIT"
          variant="caption"
          delay={ 1400 }
          stagger={ 40 }
          sx={ { color: 'background.default', letterSpacing: '0.25em' } }
        />
        <RandomRevealText
          text="MMXXVI"
          variant="caption"
          delay={ 1600 }
          stagger={ 60 }
          sx={ { color: 'background.default', letterSpacing: '0.25em' } }
        />
      </Box>
    </Box>
  );
}

/**
 * KineticPage 컴포넌트
 * 모든 섹션을 조립한 최상위 인터랙티브 페이지
 */
function KineticPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const advanceHero = useCallback(() => {
    setHeroIndex((i) => (i + 1) % HERO_WORDS.length);
  }, []);

  return (
    <Box sx={ { backgroundColor: 'background.default', color: 'text.primary' } }>
      <HeroSection wordIndex={ heroIndex } onAdvance={ advanceHero } />
      <RuleSection index="01" label="MUTATE ON CLICK" />
      <CyclerGrid />
      <RuleSection index="02" label="REVEAL ON SCROLL" />
      <ManifestoSection />
      <RuleSection index="03" label="HOVER TO DISTURB" />
      <MicroGrid />
      <FooterSection />
    </Box>
  );
}

export const Default = {
  render: () => <KineticPage />,
};
