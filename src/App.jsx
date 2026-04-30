import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { defaultTheme as theme } from './styles/themes';
import ExpandableSentence from './components/kinetic-typography/ExpandableSentence';
import buildIntroSentence from './components/kinetic-typography/buildIntroSentence';

const INTRO_SENTENCE = buildIntroSentence();

function HomePage() {
  return (
    <Box
      sx={ {
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        px: { xs: 3, sm: 6, md: 10 },
        py: { xs: 6, sm: 10, md: 16 },
      } }
    >
      <ExpandableSentence
        sentence={ INTRO_SENTENCE }
        maxWidth={ 1100 }
        fontSizeClamp={ { min: 22, vw: 3.6, max: 56 } }
        lineHeightRatio={ 1.7 }
        plainWeight={ 500 }
        keywordWeight={ 800 }
        charDelay={ 35 }
        letterSpacing={ -1.4 }
        wordGapEm={ 0.38 }
        showMinimap
      />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={ theme }>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route index element={ <HomePage /> } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
