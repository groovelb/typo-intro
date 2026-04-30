import React from 'react';
import ParticleScene from './components/ParticleScene';

function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <ParticleScene />
      
      <div className="absolute bottom-8 left-8 text-white/50 pointer-events-none select-none font-mono text-xs">
        <h1 className="text-white text-sm font-bold tracking-wider mb-1">PARTICLE FLOW</h1>
        <p>25k Particles • Vertex Shader Animation • Three.js</p>
      </div>
    </div>
  );
}

export default App;