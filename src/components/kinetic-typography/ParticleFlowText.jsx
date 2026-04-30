import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import Box from '@mui/material/Box';

const VERTEX_SHADER = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uSpeed;

attribute vec3 aTargetPos;
attribute float aRandom;

varying float vAlpha;
varying vec3 vColor;

float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
}

void main() {
  float t = mod(uTime * uSpeed + aRandom, 1.0);

  vec3 pos = aTargetPos;
  float alpha = 1.0;
  float pointSize = 3.0;

  vColor = mix(uColor1, uColor2, smoothstep(0.0, 1.0, t));

  float entryDur = 0.30;
  float stableDur = 0.50;
  float exitDur = 0.20;

  if (t < entryDur) {
    float normT = t / entryDur;
    float ease = easeOutCubic(normT);
    vec3 startPos = aTargetPos + vec3(250.0, (aRandom - 0.5) * 150.0, 0.0);
    pos = mix(startPos, aTargetPos, ease);
    alpha = smoothstep(0.0, 0.3, normT);
    pointSize *= alpha;
  } else if (t < entryDur + stableDur) {
    float normT = (t - entryDur) / stableDur;
    float driftX = -10.0 * normT;
    vec3 jitter = vec3(
      sin(uTime * 10.0 + aRandom * 50.0) * 0.1,
      cos(uTime * 8.0 + aRandom * 30.0) * 0.1,
      0.0
    );
    pos = aTargetPos + vec3(driftX, 0.0, 0.0) + jitter;
    alpha = 1.0;
  } else {
    float normT = (t - (entryDur + stableDur)) / exitDur;
    vec3 currentPos = aTargetPos + vec3(-10.0, 0.0, 0.0);
    vec3 turbulence = vec3(
      sin(uTime * 15.0 + aRandom * 20.0) * 0.5 * normT,
      cos(uTime * 12.0 + aRandom * 20.0) * 0.5 * normT,
      0.0
    );
    pos = currentPos + turbulence;
    alpha = 1.0 - normT;
    pointSize *= (1.0 - normT * 0.5);
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = pointSize;
  vAlpha = alpha;
}
`;

const FRAGMENT_SHADER = `
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord.xy - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;
  float strength = 1.0 - (dist * 2.0);
  strength = pow(strength, 2.0);
  gl_FragColor = vec4(vColor, vAlpha * strength);
}
`;

const DEFAULT_FONT_URL =
  'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json';

/** hex 색상의 상대 휘도 (0~1). 밝은 배경에서는 AdditiveBlending이 무력화되므로 NormalBlending으로 전환하기 위해 사용 */
const getLuminance = (hex) => {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
};

/**
 * ParticleFlowText 컴포넌트
 *
 * Three.js 기반 파티클 타이포그래피. 텍스트 표면을 따라 분포된 수만 개의 파티클이
 * 화면 우측에서 진입 → 안정 드리프트 → 페이드 아웃의 3단계 라이프사이클로 흐른다.
 * 커스텀 vertex/fragment shader로 GPU에서 직접 위치/색상/알파를 계산하며,
 * Additive Blending 으로 글로우 효과를 구현한다.
 *
 * Props:
 * @param {string} text - 파티클로 렌더링할 텍스트 [Optional, 기본값: 'GALAXY']
 * @param {number} particleCount - 파티클 개수 [Optional, 기본값: 25000]
 * @param {number} fontSize - 텍스트 지오메트리 크기 (Three.js unit) [Optional, 기본값: 15]
 * @param {string} colorStart - 라이프사이클 진입 색상 (hex) [Optional, 기본값: '#0F0A1F' — text.primary base]
 * @param {string} colorEnd - 라이프사이클 종료 색상 (hex) [Optional, 기본값: '#3D3949' — text.secondary base]
 * @param {string} backgroundColor - 캔버스 배경색 (hex) [Optional, 기본값: '#FBFAFE' — background.default]
 * @param {number} speed - 라이프사이클 진행 속도 [Optional, 기본값: 0.15]
 * @param {string|number} height - 컨테이너 높이 [Optional, 기본값: '100%']
 * @param {string} fontUrl - typeface.json 폰트 URL [Optional, 기본값: helvetiker CDN]
 * @param {boolean} hasZoomControl - 마우스 휠 줌 제어 활성화 [Optional, 기본값: false]
 * @param {boolean} hasMouseTilt - 마우스 위치에 따른 3D 틸트 반응 [Optional, 기본값: true]
 * @param {number} tiltStrength - 틸트 최대 각도(라디안) [Optional, 기본값: 0.35]
 * @param {object} sx - 외부 컨테이너 sx [Optional]
 *
 * Example usage:
 * <ParticleFlowText text="VIBE" particleCount={20000} colorStart="#ffffff" colorEnd="#888888" />
 */
function ParticleFlowText({
  text = 'GALAXY',
  particleCount = 25000,
  fontSize = 15,
  colorStart = '#0F0A1F',
  colorEnd = '#3D3949',
  backgroundColor = '#FBFAFE',
  speed = 0.15,
  height = '100%',
  fontUrl = DEFAULT_FONT_URL,
  hasZoomControl = false,
  hasMouseTilt = true,
  tiltStrength = 0.35,
  sx = {},
}) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color(backgroundColor), 1);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = hasZoomControl;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);
    controls.update();

    /** 텍스트 가로 약 6배 (font size * 글자수) 기준 프러스텀. 컨테이너 사이즈 기반으로 반응형 처리 */
    const TARGET_WIDTH = Math.max(fontSize * Math.max(text.length, 1) * 1.0, 60);
    const TARGET_HEIGHT = fontSize * 2.5;

    const updateCameraFrustum = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      const aspect = clientWidth / clientHeight;

      let frustumHeight;
      let frustumWidth;
      if (aspect >= TARGET_WIDTH / TARGET_HEIGHT) {
        frustumHeight = TARGET_HEIGHT;
        frustumWidth = frustumHeight * aspect;
      } else {
        frustumWidth = TARGET_WIDTH;
        frustumHeight = frustumWidth / aspect;
      }

      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    updateCameraFrustum();

    let particles;
    let material;
    let particleGeometry;
    let isDisposed = false;

    const loader = new FontLoader();
    loader.load(fontUrl, (font) => {
      if (isDisposed) return;

      const textGeometry = new TextGeometry(text, {
        font,
        size: fontSize,
        height: 0.0,
        curveSegments: 12,
        bevelEnabled: false,
      });

      textGeometry.computeBoundingBox();
      const centerOffset =
        -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
      const centerYOffset =
        -0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
      textGeometry.translate(centerOffset, centerYOffset, 0);

      const sampler = new MeshSurfaceSampler(
        new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial())
      );

      const targetPosArray = new Float32Array(particleCount * 3);
      const randomArray = new Float32Array(particleCount);
      const tempPosition = new THREE.Vector3();

      sampler.build();
      for (let i = 0; i < particleCount; i++) {
        sampler.sample(tempPosition);
        targetPosArray[i * 3] = tempPosition.x;
        targetPosArray[i * 3 + 1] = tempPosition.y;
        targetPosArray[i * 3 + 2] = tempPosition.z;
        randomArray[i] = Math.random();
      }

      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3)
      );
      particleGeometry.setAttribute(
        'aTargetPos',
        new THREE.BufferAttribute(targetPosArray, 3)
      );
      particleGeometry.setAttribute(
        'aRandom',
        new THREE.BufferAttribute(randomArray, 1)
      );

      /** 밝은 배경(luminance > 0.5)에서는 AdditiveBlending이 색을 더해 거의 보이지 않으므로 NormalBlending으로 전환 */
      const isLightBackground = getLuminance(backgroundColor) > 0.5;

      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uColor1: { value: new THREE.Color(colorStart) },
          uColor2: { value: new THREE.Color(colorEnd) },
        },
        transparent: true,
        depthWrite: false,
        blending: isLightBackground ? THREE.NormalBlending : THREE.AdditiveBlending,
      });

      particles = new THREE.Points(particleGeometry, material);
      scene.add(particles);

      textGeometry.dispose();
      setIsLoading(false);
    });

    /** 마우스 정규화 좌표 (-1..1) — pointermove로 갱신, 매 프레임 lerp로 부드럽게 추격 */
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const handlePointerLeave = () => {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    };
    if (hasMouseTilt) {
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
    }

    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      if (material) {
        material.uniforms.uTime.value = elapsedTime;
      }
      if (hasMouseTilt && particles) {
        mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.08;
        mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.08;
        particles.rotation.y = mouseCurrent.x * tiltStrength;
        particles.rotation.x = mouseCurrent.y * tiltStrength;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /** 컨테이너 사이즈 기반 리사이즈 (Storybook iframe / 임의 컨테이너 호환) */
    const resizeObserver = new ResizeObserver(updateCameraFrustum);
    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (hasMouseTilt) {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
      }
      controls.dispose();
      if (particleGeometry) particleGeometry.dispose();
      if (material) material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    text,
    particleCount,
    fontSize,
    colorStart,
    colorEnd,
    backgroundColor,
    speed,
    fontUrl,
    hasZoomControl,
    hasMouseTilt,
    tiltStrength,
  ]);

  return (
    <Box
      ref={ containerRef }
      sx={ {
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        backgroundColor,
        ...sx,
      } }
    >
      { isLoading && (
        <Box
          sx={ {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colorStart,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            opacity: 0.7,
            animation: 'particleFlowPulse 1.6s ease-in-out infinite',
            '@keyframes particleFlowPulse': {
              '0%, 100%': { opacity: 0.4 },
              '50%': { opacity: 0.9 },
            },
          } }
        >
          INITIALIZING PARTICLE SYSTEM...
        </Box>
      ) }
    </Box>
  );
}

export default ParticleFlowText;
