import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

const VERTEX_SHADER = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

attribute vec3 aTargetPos;
attribute float aRandom;

varying float vAlpha;
varying vec3 vColor;

// Cubic Out Easing for smooth, slow arrival
float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
}

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  // --- Lifecycle Management ---
  // Slower speed for "slowly come" (0.15)
  float speed = 0.15;
  float t = mod(uTime * speed + aRandom, 1.0);
  
  vec3 pos = aTargetPos;
  float alpha = 1.0;
  float pointSize = 3.0; // Base size
  
  // Color Mixing
  vColor = mix(uColor1, uColor2, smoothstep(0.0, 1.0, t));
  
  // --- Animation Phases ---
  
  // Phase splits:
  // 0.0 - 0.30: Entry (30%)
  // 0.30 - 0.80: Stable (50%)
  // 0.80 - 1.00: Exit (20%)
  
  float entryDur = 0.30;
  float stableDur = 0.50;
  float exitDur = 0.20; // remainder
  
  if (t < entryDur) {
    // PHASE 1: ENTRY FROM FAR RIGHT
    float normT = t / entryDur;
    float ease = easeOutCubic(normT);
    
    // Start from Far Right (+250.0)
    // Scatter in Y heavily for "delay" feel, keep Z=0 for 2D
    vec3 startPos = aTargetPos + vec3(250.0, (aRandom - 0.5) * 150.0, 0.0);
    
    pos = mix(startPos, aTargetPos, ease);
    
    // Fade in
    alpha = smoothstep(0.0, 0.3, normT);
    pointSize *= alpha;

  } else if (t < entryDur + stableDur) {
    // PHASE 2: STABLE
    // Drift Left to continue momentum (Right -> Left flow)
    float normT = (t - entryDur) / stableDur;
    
    // Drift to -10.0 units
    float driftX = -10.0 * normT;
    
    // Subtle vibration
    vec3 jitter = vec3(
      sin(uTime * 10.0 + aRandom * 50.0) * 0.1,
      cos(uTime * 8.0 + aRandom * 30.0) * 0.1,
      0.0
    );
    
    pos = aTargetPos + vec3(driftX, 0.0, 0.0) + jitter;
    alpha = 1.0;

  } else {
    // PHASE 3: EXIT IN PLACE
    float normT = (t - (entryDur + stableDur)) / exitDur;
    
    // Position: Where Phase 2 ended (drifted -10.0)
    // "Just disappear in place" means no extra translation
    vec3 currentPos = aTargetPos + vec3(-10.0, 0.0, 0.0);
    
    // Minimal turbulence just to keep it alive while fading
    vec3 turbulence = vec3(
        sin(uTime * 15.0 + aRandom * 20.0) * 0.5 * normT, 
        cos(uTime * 12.0 + aRandom * 20.0) * 0.5 * normT,
        0.0
    );
    
    pos = currentPos + turbulence;
    
    // Fade out
    alpha = 1.0 - normT;
    // Shrink slightly
    pointSize *= (1.0 - normT * 0.5);
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Constant size for 2D aesthetic
  gl_PointSize = pointSize; 
  vAlpha = alpha;
}
`;

const FRAGMENT_SHADER = `
varying float vAlpha;
varying vec3 vColor;

void main() {
  // Circular particle shape
  vec2 uv = gl_PointCoord.xy - 0.5;
  float dist = length(uv);
  
  if (dist > 0.5) discard;
  
  // Glow effect (radial gradient)
  float strength = 1.0 - (dist * 2.0);
  strength = pow(strength, 2.0); // Sharpen the glow
  
  gl_FragColor = vec4(vColor, vAlpha * strength);
}
`;

const ParticleScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Camera - ORTHOGRAPHIC for 2D Silhouette feel
    // Initial calculation will be overridden by updateCameraFrustum
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    
    // Position camera strictly on Z axis
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Use additive blending effectively by keeping background black/dark
    renderer.setClearColor(0x000000, 1); 
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    // Lock rotation to maintain perfect 2D view
    controls.enableRotate = false;
    // Lock pan to keep text centered
    controls.enablePan = false;
    // Ensure target is exactly 0,0,0
    controls.target.set(0, 0, 0);
    controls.update();

    // --- Camera & Resize Logic ---
    // Text is approx 70-80 units wide (font size 15 * ~5 chars). 
    // We want a base frustum that covers this width comfortably.
    const TARGET_WIDTH = 90; 
    const TARGET_HEIGHT = 40;

    const updateCameraFrustum = () => {
      const aspect = window.innerWidth / window.innerHeight;
      
      let frustumHeight;
      let frustumWidth;

      // Responsive Logic: Ensure the text fits either width-wise or height-wise
      if (aspect >= TARGET_WIDTH / TARGET_HEIGHT) {
        // Wide screen: constrained by height
        frustumHeight = TARGET_HEIGHT;
        frustumWidth = frustumHeight * aspect;
      } else {
        // Narrow screen: constrained by width
        frustumWidth = TARGET_WIDTH;
        frustumHeight = frustumWidth / aspect;
      }

      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Initial sizing
    updateCameraFrustum();

    // --- Particle System Logic ---
    let particles: THREE.Points;
    let material: THREE.ShaderMaterial;

    const loader = new FontLoader();
    
    // Load font from standard Three.js examples CDN
    loader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      
      // 1. Create Text Geometry - PERFECTLY FLAT (Height 0)
      const geometry = new TextGeometry('GALAXY', {
        font: font,
        size: 15,
        height: 0.0, // Zero thickness for perfect 2D
        curveSegments: 12,
        bevelEnabled: false, // No bevels to avoid 3D artifacts
      });

      // Center the geometry
      geometry.computeBoundingBox();
      const centerOffset = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
      const centerYOffset = -0.5 * (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y);
      geometry.translate(centerOffset, centerYOffset, 0);

      // 2. Sample Points from Surface
      // MeshBasicMaterial with double side to ensure sampling works on flat planes
      const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
      
      const particleCount = 25000;
      const targetPosArray = new Float32Array(particleCount * 3);
      const randomArray = new Float32Array(particleCount);
      
      // Temporary vector for sampling
      const _tempPosition = new THREE.Vector3();

      sampler.build();

      for (let i = 0; i < particleCount; i++) {
        sampler.sample(_tempPosition);
        
        targetPosArray[i * 3] = _tempPosition.x;
        targetPosArray[i * 3 + 1] = _tempPosition.y;
        targetPosArray[i * 3 + 2] = _tempPosition.z; // Will be 0.0

        randomArray[i] = Math.random();
      }

      // 3. Create Particle Buffer Geometry
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3)); 
      particleGeometry.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPosArray, 3));
      particleGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 1));

      // 4. Create Shader Material
      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(0x00FFFF) }, // Cyan
          uColor2: { value: new THREE.Color(0x9d4edd) }, // Purple/Violet
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(particleGeometry, material);
      scene.add(particles);

      setIsLoading(false);
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (material) {
        material.uniforms.uTime.value = elapsedTime;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', updateCameraFrustum);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', updateCameraFrustum);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (material) material.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING PARTICLE SYSTEM...
        </div>
      )}
    </div>
  );
};

export default ParticleScene;