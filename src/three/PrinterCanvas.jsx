import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, Sparkles, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import Printer from './Printer'
import { HOTSPOTS } from '../data'

const tmp = new THREE.Vector3()
const nrm = new THREE.Vector3()
const toCam = new THREE.Vector3()
const Y_OFFSET = -1.15

// Внутри Canvas: проецирует точки модели на экран и двигает DOM-маркеры напрямую, без ре-рендера
function Projector({ els, setSides }) {
  const sides = useRef({})
  useFrame(({ camera, size }) => {
    let changed = false
    HOTSPOTS.forEach((spot) => {
      const el = els.current[spot.id]
      if (!el) return
      tmp.set(spot.position[0], spot.position[1] + Y_OFFSET, spot.position[2])
      nrm.set(...spot.normal).normalize()
      toCam.copy(camera.position).sub(tmp).normalize()
      const visible = toCam.dot(nrm) > 0.05
      tmp.project(camera)
      const x = (tmp.x * 0.5 + 0.5) * size.width
      const y = (-tmp.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      el.style.opacity = visible ? '1' : '0'
      el.style.pointerEvents = visible ? 'auto' : 'none'
      const side = x > size.width * 0.55 ? 'left' : 'right'
      if (sides.current[spot.id] !== side) { sides.current[spot.id] = side; changed = true }
    })
    if (changed) setSides({ ...sides.current })
  })
  return null
}

function Hotspot({ spot, active, setActive, side, elRef }) {
  const Icon = spot.icon
  const isOn = active === spot.id
  return (
    <div ref={elRef} className="absolute left-0 top-0 transition-opacity duration-300" style={{ zIndex: isOn ? 30 : 10, opacity: 0 }}>
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <button
          aria-label={spot.title}
          onMouseEnter={() => setActive(spot.id)}
          onClick={() => setActive(isOn ? null : spot.id)}
          className="relative grid h-8 w-8 place-items-center rounded-full"
        >
          <span className="ping-soft absolute inset-0 rounded-full bg-mint/40" />
          <span className={`relative grid h-7 w-7 place-items-center rounded-full border text-ink shadow-[0_0_24px_#2ef2a4aa] transition-colors ${isOn ? 'border-white bg-white' : 'border-mint bg-mint'}`}>
            <Icon size={14} strokeWidth={2.5} />
          </span>
        </button>
        <AnimatePresence>
          {isOn && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 6, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className={`glass absolute top-1/2 w-60 -translate-y-1/2 rounded-2xl p-4 text-left shadow-2xl shadow-black/50 ${side === 'left' ? 'right-11' : 'left-11'}`}
              style={{ background: 'linear-gradient(160deg,#0f1b2bee,#0a1220ee)' }}
            >
              <div className="mb-1.5 flex items-center gap-2 text-mint">
                <Icon size={16} />
                <span className="font-display text-[13px] font-semibold tracking-tight text-white">{spot.title}</span>
              </div>
              <p className="text-[13px] leading-snug text-slate-300">{spot.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function PrinterCanvas({ active, setActive, paused }) {
  const els = useRef({})
  const [sides, setSides] = useState({})
  return (
    <div className="absolute inset-0">
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [3.4, 1.9, 4.6], fov: 32 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onPointerMissed={() => setActive(null)}
      style={{ maskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000 60%, transparent 100%)' }}
    >
      <color attach="background" args={['#070b14']} />
      <fog attach="fog" args={['#070b14', 7, 13]} />
      <AdaptiveDpr pixelated={false} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 7, 4]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5, 3, -4]} intensity={2.2} color="#38bdf8" />
      <pointLight position={[0, 0.6, 2.4]} intensity={4} distance={4} color="#2ef2a4" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#38bdf8" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#2ef2a4" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>

      <Suspense fallback={null}>
        <Printer active={active} setActive={setActive} />
      </Suspense>
      <Projector els={els} setSides={setSides} />

      <mesh rotation-x={-Math.PI / 2} position={[0, -1.17, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.45} />
      </mesh>
      <Sparkles count={60} scale={[5, 3.5, 5]} size={2.2} speed={0.35} color="#2ef2a4" opacity={0.6} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!active}
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.5}
        target={[0, -0.05, 0]}
        enableDamping
      />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.95} luminanceSmoothing={0.2} />
      </EffectComposer>
    </Canvas>
      {HOTSPOTS.map((s) => (
        <Hotspot key={s.id} spot={s} active={active} setActive={setActive} side={sides[s.id]} elRef={(el) => (els.current[s.id] = el)} />
      ))}
    </div>
  )
}
