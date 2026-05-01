import { useEffect, useRef } from 'react';
import useSound from 'use-sound';
import keyUrl from '../../assets/sounds/typewriter-key.mp3';

/**
 * useTypingSound 훅
 *
 * positioned atom 풀의 변화를 관찰해서 타자기 키 사운드를 재생.
 *  - 글자가 한 개 이상 추가될 때마다 key 사운드 (pitch ±7% 랜덤)
 *  - 백스페이스(글자 감소) 는 무음
 *  - 첫 마운트 (initial total) 는 사운드 없음
 *
 * @param {Array} positioned - layoutAtoms 결과 [{ revealedChars, ... }]
 * @param {object} options - { muted, keyVolume }
 */
export default function useTypingSound(positioned, { muted = false, keyVolume = 0.3 } = {}) {
  const [playKey] = useSound(keyUrl, { volume: keyVolume, interrupt: false });

  const snapshotRef = useRef(null);

  useEffect(() => {
    let totalRevealed = 0;
    for (const a of positioned) {
      totalRevealed += a.revealedChars;
    }

    const prev = snapshotRef.current;
    snapshotRef.current = { totalRevealed };

    if (prev === null || muted) return;

    const delta = totalRevealed - prev.totalRevealed;
    if (delta !== 0) {
      const rateBase = delta < 0 ? 1.05 : 0.93;
      playKey({ playbackRate: rateBase + Math.random() * 0.14 });
    }
  }, [positioned, muted, playKey]);
}
