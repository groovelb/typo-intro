import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import measureWord from './measureWord';
import useTypingSound from './useTypingSound';

const TOKEN_PATTERN = '\\[([^\\]]+)\\]([^\\s[\\]]*)|[^\\s[\\]]+';

/**
 * ExpandableSentence 컴포넌트
 *
 * 한 문장 안의 키워드(`[키워드]`) 클릭 시 그 자리에서 새 문장이 인라인으로 펼쳐진다.
 * 무한 재귀. 다시 클릭하면 후손까지 회수.
 *
 * 외관: 순수 단락. 라인/박스/언더라인/메타 라벨/푸터 일체 없음.
 *
 * 인터랙션: 진짜 타자기.
 *  - 모든 어절은 글자 단위 등장 (charDelay 마다 한 글자, 순차적)
 *  - transition / spring / fade / scale 일체 없음 — 글자가 *탁* 나타남
 *  - 새 글자가 등장하면 뒤에 있는 모든 어절이 그 글자의 *정확한 폭만큼* 즉시 밀려남
 *    (layout 이 매 프레임 현재 revealedChars 기준으로 재계산)
 *  - 접힘 시 마지막 글자부터 *탁탁* 사라지며 뒷 어절이 그만큼 즉시 당겨짐
 *
 * Props:
 * @param {object} sentence - { text, expansions: { 키워드: { text, expansions? } } } [Required]
 * @param {number} maxWidth - 컨테이너 최대 폭 (px). 실제 폭은 ResizeObserver 로 매번 측정되어 pretext 에 그대로 전달 — 윈도우/부모 변화에 즉시 reflow [Optional, 기본값: 1100]
 * @param {number} fontSize - 본문 폰트 사이즈 (px) [Optional, 기본값: 28]
 * @param {number} lineHeight - line-height (px) [Optional, 기본값: 44]
 * @param {string} fontFamily - 폰트 패밀리 [Optional]
 * @param {number} plainWeight - 평문 어절 font-weight [Optional, 기본값: 400]
 * @param {number} keywordWeight - 키워드 어절 font-weight [Optional, 기본값: 500]
 * @param {number} charDelay - 글자 사이 ms [Optional, 기본값: 45]
 * @param {boolean} isMuted - 타이핑 사운드 음소거 [Optional, 기본값: false]
 * @param {number} keyVolume - 키 사운드 볼륨 0~1 [Optional, 기본값: 0.3]
 * @param {number} letterSpacing - 자간 px (음수=좁힘) [Optional, 기본값: -1.5]
 * @param {number} wordGapEm - 어절 간 간격 (em 단위, fontSize 곱해서 px 산출) [Optional, 기본값: 0.32]
 * @param {object} fontSizeClamp - CSS clamp(min, vw%, max) 반응형 fontSize. { min, vw, max }. 설정 시 fontSize prop 무시. JS 로 동일 값 계산해 pretext 측정에 그대로 사용 [Optional, 기본값: null]
 * @param {number} lineHeightRatio - lineHeight = fontSize × ratio (lineHeight prop 없을 때만) [Optional, 기본값: 1.7]
 * @param {boolean} showMinimap - 우상단 키워드 트리 미니맵 표시 [Optional, 기본값: true]
 *
 * Example usage:
 * <ExpandableSentence sentence={ { text: '나는 [도구]를 다룬다.', expansions: { '도구': { text: 'CLI 와 YOLO' } } } } />
 */
function ExpandableSentence({
  sentence,
  maxWidth = 1100,
  fontSize = 44,
  lineHeight,
  fontFamily = '"Wanted Sans Variable", "Pretendard Variable", "Apple SD Gothic Neo", system-ui, sans-serif',
  plainWeight = 500,
  keywordWeight = 700,
  charDelay = 45,
  isMuted = false,
  keyVolume = 0.3,
  letterSpacing = -1.5,
  wordGapEm = 0.38,
  fontSizeClamp = null,
  lineHeightRatio = 1.7,
  showMinimap = true,
}) {
  const containerRef = useRef(null);
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  const [actualWidth, setActualWidth] = useState(maxWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width);
        if (w > 0) setActualWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const actualFontSize = fontSizeClamp
    ? Math.max(fontSizeClamp.min, Math.min(fontSizeClamp.max, (fontSizeClamp.vw / 100) * vw))
    : fontSize;
  const actualLineHeight = lineHeight ?? actualFontSize * lineHeightRatio;
  const expandedRef = useRef(new Set());

  const layoutOptions = useMemo(
    () => ({
      width: actualWidth,
      fontFamily,
      fontSize: actualFontSize,
      lineHeight: actualLineHeight,
      letterSpacing,
      wordGapEm,
    }),
    [actualWidth, fontFamily, actualFontSize, actualLineHeight, letterSpacing, wordGapEm],
  );

  const [hoveredId, setHoveredId] = useState(null);

  const [atoms, setAtoms] = useState(() => {
    const built = buildAtoms(sentence, new Set(), plainWeight, keywordWeight);
    return built.map((a) => ({
      ...a,
      phase: 'idle',
      revealedChars: a.text.length,
    }));
  });

  const stillAnimating = useMemo(
    () => atoms.some((a) => a.phase !== 'idle'),
    [atoms],
  );

  useEffect(() => {
    if (!stillAnimating) return undefined;
    let cancelled = false;
    let rafId = 0;
    const tick = () => {
      if (cancelled) return;
      setAtoms((prev) => {
        const result = tickAtoms(prev, performance.now(), charDelay);
        return result.changed ? result.atoms : prev;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [stillAnimating, charDelay]);

  const toggleExpansion = useCallback((atomId) => {
    const next = new Set(expandedRef.current);
    if (next.has(atomId)) {
      for (const p of [...next]) {
        if (p === atomId || p.startsWith(`${atomId}/`)) next.delete(p);
      }
    } else {
      next.add(atomId);
    }
    expandedRef.current = next;

    const targetAtoms = buildAtoms(sentence, next, plainWeight, keywordWeight);
    setAtoms((prev) => reconcile(prev, targetAtoms, performance.now(), charDelay));
  }, [sentence, plainWeight, keywordWeight, charDelay]);

  const onAtomClick = useCallback((atom) => {
    if (!atom.clickPath) return;
    toggleExpansion(atom.clickPath);
  }, [toggleExpansion]);

  const positioned = useMemo(
    () => layoutAtoms(atoms, layoutOptions),
    [atoms, layoutOptions],
  );

  useTypingSound(positioned, { muted: isMuted, keyVolume });

  const totalHeight = useMemo(() => {
    let max = actualLineHeight;
    for (const a of positioned) {
      if (a.y + actualLineHeight > max) max = a.y + actualLineHeight;
    }
    return max;
  }, [positioned, actualLineHeight]);

  return (
    <Box
      ref={ containerRef }
      sx={ {
        position: 'relative',
        width: '100%',
        maxWidth,
        minHeight: totalHeight,
        fontFamily,
        color: 'text.primary',
        wordBreak: 'keep-all',
      } }
    >
      { positioned.map((atom) => {
        if (atom.revealedChars === 0) return null;
        const showIndicator = atom.hasExpansion
          && atom.phase !== 'exiting'
          && atom.revealedChars === atom.text.length;
        const inScope = !hoveredId
          || atom.id === hoveredId
          || atom.id.startsWith(`${hoveredId}/`);
        return (
          <span
            key={ atom.id }
            onClick={ () => onAtomClick(atom) }
            onMouseEnter={ atom.clickPath ? () => setHoveredId(atom.id) : undefined }
            onMouseLeave={ atom.clickPath ? () => setHoveredId(null) : undefined }
            style={ {
              position: 'absolute',
              left: atom.x,
              top: atom.y,
              whiteSpace: 'nowrap',
              fontSize: actualFontSize,
              fontWeight: atom.weight,
              fontFamily,
              letterSpacing: `${letterSpacing}px`,
              cursor: atom.clickPath ? 'pointer' : 'default',
              lineHeight: 1,
              userSelect: 'none',
              opacity: inScope ? 1 : 0.18,
              transition: 'opacity 180ms ease',
            } }
          >
            { atom.text.slice(0, atom.revealedChars) }
            { showIndicator && (
              <span
                aria-hidden='true'
                style={ {
                  position: 'absolute',
                  right: '-0.5em',
                  top: '-0.18em',
                  fontSize: '0.42em',
                  fontWeight: atom.weight,
                  letterSpacing: 0,
                  color: 'inherit',
                  pointerEvents: 'none',
                } }
              >
                { atom.isExpanded ? '−' : '+' }
              </span>
            ) }
          </span>
        );
      }) }
      { showMinimap && (
        <KeywordMinimap
          atoms={ atoms }
          onToggle={ toggleExpansion }
          hoveredId={ hoveredId }
          onHover={ setHoveredId }
        />
      ) }
    </Box>
  );
}

/**
 * KeywordMinimap — 우상단 fixed 키워드 트리 미니맵
 *
 * 현재 atom 풀의 키워드 atom 들을 path 기반 계층 트리로 시각화한다.
 * leaf 키워드(hasExpansion=false) 는 ·, 펼친 키워드는 −, 접힌 키워드는 + 로 표시.
 * 펼친 노드는 굵게.
 */
function KeywordMinimap({ atoms, onToggle, hoveredId, onHover }) {
  const tree = buildKeywordTree(atoms);
  if (tree.length === 0) return null;
  return (
    <Box
      sx={ {
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 10,
        maxWidth: 300,
        maxHeight: '85vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(245, 240, 250, 0.94)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider',
        p: 1.75,
        fontFamily: '"Wanted Sans Variable", "Pretendard Variable", system-ui, sans-serif',
        fontSize: 11,
        lineHeight: 1.5,
        color: 'text.primary',
        userSelect: 'none',
      } }
    >
      <Box sx={ { fontSize: 9, opacity: 0.55, letterSpacing: '0.08em', mb: 1, textTransform: 'uppercase' } }>
        Keyword Tree
      </Box>
      { tree.map((node) => (
        <MinimapNode
          key={ node.atom.id }
          node={ node }
          depth={ 0 }
          onToggle={ onToggle }
          hoveredId={ hoveredId }
          onHover={ onHover }
        />
      )) }
    </Box>
  );
}

function MinimapNode({ node, depth, onToggle, hoveredId, onHover }) {
  const { atom, children } = node;
  const indicator = atom.hasExpansion ? (atom.isExpanded ? '−' : '+') : '·';
  const inScope = !hoveredId || atom.id === hoveredId || atom.id.startsWith(`${hoveredId}/`);
  const handleToggle = atom.hasExpansion
    ? (ev) => {
      ev.stopPropagation();
      onToggle(atom.id);
    }
    : undefined;
  const handleEnter = atom.hasExpansion ? () => onHover(atom.id) : undefined;
  const handleLeave = atom.hasExpansion ? () => onHover(null) : undefined;
  return (
    <>
      <Box
        onMouseEnter={ handleEnter }
        onMouseLeave={ handleLeave }
        sx={ {
          display: 'flex',
          alignItems: 'baseline',
          gap: 0.75,
          pl: depth * 1.4,
          py: 0.5,
          opacity: inScope ? (atom.isExpanded ? 1 : 0.7) : 0.18,
          fontWeight: atom.isExpanded ? 600 : 400,
          transition: 'opacity 180ms ease',
        } }
      >
        <Box
          component='span'
          onClick={ handleToggle }
          sx={ {
            width: 14,
            fontFamily: 'monospace',
            fontSize: 13,
            fontWeight: 600,
            color: 'text.primary',
            flexShrink: 0,
            cursor: atom.hasExpansion ? 'pointer' : 'default',
            textAlign: 'center',
          } }
        >
          { indicator }
        </Box>
        <Box
          component='span'
          onClick={ handleToggle }
          sx={ {
            wordBreak: 'keep-all',
            cursor: atom.hasExpansion ? 'pointer' : 'default',
          } }
        >
          { atom.keywordLabel || atom.text }
        </Box>
      </Box>
      { children.map((c) => (
        <MinimapNode
          key={ c.atom.id }
          node={ c }
          depth={ depth + 1 }
          onToggle={ onToggle }
          hoveredId={ hoveredId }
          onHover={ onHover }
        />
      )) }
    </>
  );
}

function buildKeywordTree(atoms) {
  const keywordAtoms = atoms.filter((a) => a.isKeyword && a.phase !== 'exiting');
  const nodes = new Map();
  for (const a of keywordAtoms) {
    nodes.set(a.id, { atom: a, children: [] });
  }
  const roots = [];
  for (const a of keywordAtoms) {
    const pid = parentKeywordId(a.id);
    if (pid && nodes.has(pid)) {
      nodes.get(pid).children.push(nodes.get(a.id));
    } else {
      roots.push(nodes.get(a.id));
    }
  }
  return roots;
}

function parentKeywordId(atomId) {
  const lastK = atomId.lastIndexOf('/k:');
  if (lastK === -1) return null;
  const beforeKw = atomId.substring(0, lastK);
  if (beforeKw.endsWith('/e')) return beforeKw.substring(0, beforeKw.length - 2);
  return null;
}

function buildAtoms(sentence, expanded, plainWeight, keywordWeight) {
  const atoms = [];
  walk(sentence, 'r', expanded, atoms, plainWeight, keywordWeight);
  return atoms;
}

function walk(node, path, expanded, atoms, plainWeight, keywordWeight) {
  const re = new RegExp(TOKEN_PATTERN, 'g');
  let wordIdx = 0;
  let m;
  while ((m = re.exec(node.text)) !== null) {
    if (m[1] !== undefined) {
      const keyword = m[1];
      const trailing = m[2] || '';
      const kPath = `${path}/k:${keyword}`;
      const hasExpansion = Boolean(node.expansions && node.expansions[keyword]);
      const isExpanded = expanded.has(kPath);
      atoms.push({
        id: kPath,
        clickPath: hasExpansion ? kPath : null,
        text: keyword + trailing,
        weight: keywordWeight,
        hasExpansion,
        isExpanded,
        isKeyword: true,
        keywordLabel: keyword,
      });
      if (isExpanded && hasExpansion) {
        walk(node.expansions[keyword], `${kPath}/e`, expanded, atoms, plainWeight, keywordWeight);
      }
    } else {
      const word = m[0];
      atoms.push({
        id: `${path}/w${wordIdx}:${word}`,
        clickPath: null,
        text: word,
        weight: plainWeight,
        hasExpansion: false,
        isExpanded: false,
        isKeyword: false,
        keywordLabel: null,
      });
      wordIdx += 1;
    }
  }
}

/**
 * 매 프레임 호출. revealedChars 기준으로 displayed text 폭 측정 → greedy line wrap.
 * revealedChars=0 인 atom 은 폭 0, x 도 누적 안 함 (다음 어절이 자기 자리로 흐름).
 */
function layoutAtoms(atoms, { width, fontFamily, fontSize, lineHeight, letterSpacing, wordGapEm }) {
  let x = 0;
  let y = 0;
  const gap = wordGapEm * fontSize;
  const out = [];
  for (const atom of atoms) {
    const displayed = atom.text.slice(0, atom.revealedChars);
    if (!displayed) {
      out.push({ ...atom, x, y, width: 0 });
      continue;
    }
    const font = `${atom.weight} ${fontSize}px ${fontFamily}`;
    const w = measureWord(displayed, font, letterSpacing);
    if (x + w > width && x > 0) {
      x = 0;
      y += lineHeight;
    }
    out.push({ ...atom, x, y, width: w });
    x += w + gap;
  }
  return out;
}

/**
 * 펼침/접힘 시 atom 풀 재구성. 진짜 타자기.
 * - 신규 atom: target 위치에 삽입, enterAt = now + (앞선 신규 atom 글자수 × charDelay)
 * - 사라질 atom: *원래 흐름 위치* 보존. exitAt 만 역순(뒤에서부터 backspace) 으로 부여
 * - 이미 exiting 인 atom: 원래 위치에 그대로 유지
 *
 * 핵심: result 배열 순서 = 원래 흐름 순서. 그래야 layout 이 시각적으로 안정적.
 */
function reconcile(prev, target, now, charDelay) {
  const targetIds = new Set(target.map((a) => a.id));
  const prevById = new Map(prev.map((a) => [a.id, a]));

  const result = [];
  let enterCursor = 0;
  for (const t of target) {
    const cur = prevById.get(t.id);
    if (cur && cur.phase !== 'exiting') {
      result.push({
        ...cur,
        clickPath: t.clickPath,
        text: t.text,
        weight: t.weight,
        hasExpansion: t.hasExpansion,
        isExpanded: t.isExpanded,
        isKeyword: t.isKeyword,
        keywordLabel: t.keywordLabel,
      });
    } else {
      result.push({
        ...t,
        phase: 'entering',
        revealedChars: 0,
        enterAt: now + enterCursor,
      });
      enterCursor += t.text.length * charDelay;
    }
  }

  const newExiting = prev.filter((a) => !targetIds.has(a.id) && a.phase !== 'exiting');

  const exitTimes = new Map();
  let exitCursor = 0;
  for (let i = newExiting.length - 1; i >= 0; i -= 1) {
    const e = newExiting[i];
    exitTimes.set(e.id, now + exitCursor);
    exitCursor += e.text.length * charDelay;
  }

  const insertAtPrevPosition = (atomId, item) => {
    const prevIndex = prev.findIndex((a) => a.id === atomId);
    for (let i = prevIndex + 1; i < prev.length; i += 1) {
      const idx = result.findIndex((r) => r.id === prev[i].id);
      if (idx !== -1) {
        result.splice(idx, 0, item);
        return;
      }
    }
    result.push(item);
  };

  for (const e of newExiting) {
    insertAtPrevPosition(e.id, {
      ...e,
      phase: 'exiting',
      exitAt: exitTimes.get(e.id),
    });
  }

  for (const c of prev) {
    if (c.phase === 'exiting' && !result.some((r) => r.id === c.id)) {
      insertAtPrevPosition(c.id, c);
    }
  }

  return result;
}

function tickAtoms(atoms, now, charDelay) {
  let changed = false;
  const next = [];
  for (const a of atoms) {
    if (a.phase === 'idle') {
      next.push(a);
      continue;
    }
    if (a.phase === 'entering') {
      if (now < a.enterAt) {
        next.push(a);
        continue;
      }
      const target = Math.min(
        a.text.length,
        Math.floor((now - a.enterAt) / charDelay) + 1,
      );
      if (target !== a.revealedChars) {
        const newPhase = target === a.text.length ? 'idle' : 'entering';
        next.push({ ...a, revealedChars: target, phase: newPhase });
        changed = true;
      } else {
        next.push(a);
      }
    } else if (a.phase === 'exiting') {
      if (now < a.exitAt) {
        next.push(a);
        continue;
      }
      const target = Math.max(
        0,
        a.text.length - Math.floor((now - a.exitAt) / charDelay) - 1,
      );
      if (target !== a.revealedChars) {
        next.push({ ...a, revealedChars: target });
        changed = true;
      } else {
        next.push(a);
      }
    }
  }
  const filtered = next.filter((a) => !(a.phase === 'exiting' && a.revealedChars === 0));
  if (filtered.length !== next.length) changed = true;
  return { atoms: filtered, changed };
}

export default ExpandableSentence;
