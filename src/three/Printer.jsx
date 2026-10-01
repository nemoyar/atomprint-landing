import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges } from '@react-three/drei'
import * as THREE from 'three'

const MINT = '#2ef2a4'
const VOLT = '#38bdf8'

const damp = THREE.MathUtils.damp

function usePanelTexture() {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 300
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { canvas, texture }
  }, [])

  // Экран панели: перерисовываем раз в ~250 мс, а не каждый кадр
  const draw = (t, pages) => {
    const c = canvas.getContext('2d')
    const g = c.createLinearGradient(0, 0, 512, 300)
    g.addColorStop(0, '#04121c')
    g.addColorStop(1, '#071a14')
    c.fillStyle = g
    c.fillRect(0, 0, 512, 300)
    c.fillStyle = MINT
    c.font = '600 30px Unbounded, sans-serif'
    c.fillText('АТОМПРИНТ', 28, 52)
    c.fillStyle = '#7dd3fc'
    c.font = '500 20px Manrope, sans-serif'
    c.fillText('● онлайн · мониторинг активен', 28, 86)
    const toners = [['K', '#e2e8f0', 0.72], ['C', '#22d3ee', 0.55], ['M', '#f472b6', 0.31], ['Y', '#facc15', 0.84]]
    toners.forEach(([n, col, lvl], i) => {
      const x = 28 + i * 70
      c.fillStyle = '#ffffff14'
      c.fillRect(x, 110, 44, 110)
      const l = lvl - 0.02 * Math.sin(t * 0.7 + i)
      c.fillStyle = col
      c.fillRect(x, 110 + 110 * (1 - l), 44, 110 * l)
      c.fillStyle = '#94a3b8'
      c.font = '600 18px Manrope, sans-serif'
      c.fillText(n, x + 15, 245)
    })
    c.fillStyle = '#ffffff10'
    c.fillRect(320, 110, 168, 135)
    c.fillStyle = '#94a3b8'
    c.font = '500 17px Manrope, sans-serif'
    c.fillText('страниц сегодня', 334, 140)
    c.fillStyle = '#fff'
    c.font = '600 40px Unbounded, sans-serif'
    c.fillText(String(pages), 334, 192)
    c.fillStyle = MINT
    c.font = '500 16px Manrope, sans-serif'
    c.fillText('заказ тонера M: авто', 334, 228)
    texture.needsUpdate = true
  }
  return { texture, draw }
}

function useLogoTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const paint = () => {
      const c = canvas.getContext('2d')
      c.clearRect(0, 0, 512, 96)
      c.fillStyle = '#334155'
      c.font = '600 44px Unbounded, sans-serif'
      c.fillText('АТОМПРИНТ', 8, 64)
      tex.needsUpdate = true
    }
    paint()
    document.fonts?.ready.then(paint)
    return tex
  }, [])
}

function Sheets() {
  const N = 5
  const PERIOD = 1.4
  const refs = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const phase = ((t + i * PERIOD) % (N * PERIOD)) / PERIOD // 0..N
      const out = Math.min(phase, 1)
      const e = 1 - Math.pow(1 - out, 3)
      m.position.x = THREE.MathUtils.lerp(0.25, -0.28, e)
      m.position.y = 1.655 + 0.004 * i + (phase < 1 ? 0.03 * Math.sin(out * Math.PI) : 0)
      m.rotation.z = phase < 1 ? 0.06 * Math.sin(out * Math.PI) : 0
      const fade = phase > N - 1 ? 1 - (phase - (N - 1)) : 1
      m.material.opacity = Math.max(0, fade)
    })
  })
  return (
    <group>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} rotation-x={-Math.PI / 2} castShadow>
          <planeGeometry args={[0.62, 0.44]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} side={THREE.DoubleSide} transparent />
        </mesh>
      ))}
      {/* стопка уже напечатанного */}
      <mesh position={[-0.28, 1.64, 0]} castShadow>
        <boxGeometry args={[0.62, 0.02, 0.44]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.95} />
      </mesh>
    </group>
  )
}

function Highlight({ on }) {
  return on ? <Edges color={MINT} lineWidth={2} threshold={20} /> : null
}

export default function Printer({ active, setActive }) {
  const root = useRef()
  const trayRef = useRef()
  const doorRef = useRef()
  const lidRef = useRef()
  const scanRef = useRef()
  const ledRef = useRef()
  const ringRef = useRef()
  const pages = useRef(1284)
  const lastDraw = useRef(0)
  const { texture: panelTex, draw } = usePanelTexture()
  const logoTex = useLogoTexture()

  useEffect(() => { document.fonts?.ready.then(() => draw(0, pages.current)) }, [draw])

  const plastic = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#dfe4eb', roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
    [],
  )
  const plasticDark = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#1e2533', roughness: 0.55, clearcoat: 0.2 }),
    [],
  )
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9aa4b2', metalness: 0.9, roughness: 0.25 }), [])

  const hover = (id) => ({
    onPointerOver: (e) => { e.stopPropagation(); setActive(id); document.body.style.cursor = 'pointer' },
    onPointerOut: () => { document.body.style.cursor = '' },
    onClick: (e) => { e.stopPropagation(); setActive(id) },
  })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    // "дыхание"
    root.current.position.y = -1.15 + Math.sin(t * 1.1) * 0.035
    root.current.rotation.z = Math.sin(t * 0.7) * 0.008

    trayRef.current.position.z = damp(trayRef.current.position.z, active === 'tray' ? 0.38 : 0, 6, dt)
    doorRef.current.rotation.x = damp(doorRef.current.rotation.x, active === 'toner' ? 1.15 : 0, 5, dt)
    lidRef.current.rotation.x = damp(lidRef.current.rotation.x, active === 'scan' ? -0.95 : -0.32, 4, dt)

    scanRef.current.position.x = Math.sin(t * 1.6) * 0.5 - 0.1
    ledRef.current.material.emissiveIntensity = active === 'panel' ? 6 + Math.sin(t * 10) * 3 : 3 + Math.sin(t * 2.4) * 1.2

    const s = 1 + Math.sin(t * 1.4) * 0.04
    ringRef.current.scale.set(s, s, s)
    ringRef.current.material.opacity = 0.35 + Math.sin(t * 1.4) * 0.12

    if (t - lastDraw.current > 0.25) {
      lastDraw.current = t
      pages.current += Math.random() < 0.6 ? 1 : 0
      draw(t, pages.current)
    }
  })

  return (
    <group ref={root} position={[0, -1.15, 0]}>
      {/* подсветка пола */}
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
        <ringGeometry args={[1.15, 1.22, 96]} />
        <meshBasicMaterial color={MINT} transparent opacity={0.4} toneMapped={false} />
      </mesh>

      {/* колёса */}
      {[[-0.62, -0.52], [0.62, -0.52], [-0.62, 0.52], [0.62, 0.52]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} rotation-z={Math.PI / 2} material={plasticDark} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
        </mesh>
      ))}

      {/* тумба с лотками */}
      <RoundedBox args={[1.5, 0.82, 1.3]} radius={0.03} smoothness={3} position={[0, 0.51, 0]} material={plastic} castShadow receiveShadow />
      <mesh position={[0, 0.7, 0.64]} material={plastic} castShadow {...hover('tray')}>
        <boxGeometry args={[1.4, 0.34, 0.04]} />
        <Highlight on={active === 'tray'} />
      </mesh>
      <mesh position={[-0.2, 0.84, 0.665]} material={plasticDark}>
        <boxGeometry args={[0.42, 0.045, 0.02]} />
      </mesh>

      {/* выдвижной лоток 1 с бумагой */}
      <group ref={trayRef} {...hover('tray')}>
        <mesh position={[0, 0.3, 0.64]} material={plastic} castShadow>
          <boxGeometry args={[1.4, 0.34, 0.04]} />
          <Highlight on={active === 'tray'} />
        </mesh>
        <mesh position={[-0.2, 0.44, 0.665]} material={plasticDark}>
          <boxGeometry args={[0.42, 0.045, 0.02]} />
        </mesh>
        <mesh position={[0.52, 0.42, 0.665]}>
          <boxGeometry args={[0.12, 0.02, 0.01]} />
          <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.3, 0.2]} material={plasticDark}>
          <boxGeometry args={[1.3, 0.2, 0.84]} />
        </mesh>
        <mesh position={[0, 0.43, 0.2]} castShadow>
          <boxGeometry args={[1.0, 0.07, 0.7]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.95} />
        </mesh>
      </group>

      {/* корпус */}
      <RoundedBox args={[1.5, 0.7, 1.2]} radius={0.03} smoothness={3} position={[0, 1.27, -0.05]} material={plastic} castShadow receiveShadow />
      <mesh position={[0, 1.27, 0.56]}>
        <boxGeometry args={[1.36, 0.6, 0.02]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.8} />
      </mesh>
      {[-0.715, 0.715].map((x) => (
        <mesh key={x} position={[x, 1.27, 0.6]} material={plastic}>
          <boxGeometry args={[0.07, 0.7, 0.1]} />
        </mesh>
      ))}
      {/* картриджи CMYK */}
      {[['#111827', -0.36], ['#06b6d4', -0.12], ['#ec4899', 0.12], ['#eab308', 0.36]].map(([c, x]) => (
        <group key={x} position={[x, 1.3, 0.56]}>
          <mesh rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.08, 28]} />
            <meshPhysicalMaterial color={c} roughness={0.3} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, -0.13, 0.03]}>
            <boxGeometry args={[0.12, 0.012, 0.012]} />
            <meshStandardMaterial color={c} emissive={c === '#111827' ? '#e2e8f0' : c} emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* дверца, открывается вниз на петле */}
      <group ref={doorRef} position={[0, 0.98, 0.64]} {...hover('toner')}>
        <mesh position={[0, 0.29, 0]} material={plastic} castShadow>
          <boxGeometry args={[1.36, 0.58, 0.035]} />
          <Highlight on={active === 'toner'} />
        </mesh>
        <mesh position={[-0.2, 0.32, 0.02]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial map={logoTex} transparent />
        </mesh>
        <mesh position={[0.45, 0.32, 0.02]} material={metal}>
          <boxGeometry args={[0.22, 0.03, 0.01]} />
        </mesh>
      </group>

      {/* внутренний выходной лоток */}
      <mesh position={[0, 1.625, 0]} material={plasticDark} receiveShadow>
        <boxGeometry args={[1.5, 0.01, 1.3]} />
      </mesh>
      <mesh position={[0.32, 1.74, -0.2]} material={plasticDark}>
        <boxGeometry args={[0.3, 0.24, 0.9]} />
      </mesh>
      <RoundedBox args={[0.26, 0.24, 1.3]} radius={0.02} position={[0.62, 1.74, 0]} material={plastic} castShadow />
      <mesh position={[-0.05, 1.735, -0.62]} material={plasticDark}>
        <boxGeometry args={[1.1, 0.23, 0.06]} />
      </mesh>
      <Sheets />
      <mesh position={[-0.12, 1.848, 0.645]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={4} toneMapped={false} />
      </mesh>

      {/* сканер */}
      <RoundedBox args={[1.5, 0.2, 1.3]} radius={0.03} smoothness={3} position={[0, 1.96, 0]} material={plastic} castShadow receiveShadow />
      <mesh position={[-0.1, 2.061, 0]}>
        <boxGeometry args={[1.12, 0.004, 0.86]} />
        <meshStandardMaterial color="#020617" roughness={0.6} />
      </mesh>
      <mesh ref={scanRef} position={[0, 2.066, 0]}>
        <boxGeometry args={[0.035, 0.006, 0.84]} />
        <meshStandardMaterial color={VOLT} emissive={VOLT} emissiveIntensity={6} toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 2.072, 0]} {...hover('scan')}>
        <boxGeometry args={[1.12, 0.008, 0.86]} />
        <meshPhysicalMaterial color="#0f2a3a" transparent opacity={0.45} roughness={0.04} metalness={0.2} clearcoat={1} />
        <Highlight on={active === 'scan'} />
      </mesh>

      {/* крышка-автоподатчик на петле сзади */}
      <group ref={lidRef} position={[0, 2.07, -0.62]} rotation-x={-0.32} {...hover('scan')}>
        <RoundedBox args={[1.44, 0.1, 1.22]} radius={0.03} smoothness={3} position={[0, 0.05, 0.61]} material={plastic} castShadow />
        <mesh position={[-0.05, 0.002, 0.61]}>
          <boxGeometry args={[1.1, 0.004, 0.84]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
        <mesh position={[-0.1, 0.115, 0.55]} castShadow>
          <boxGeometry args={[0.62, 0.03, 0.44]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.95} />
        </mesh>
        <mesh position={[0.55, 0.11, 0.61]} material={plasticDark}>
          <boxGeometry args={[0.18, 0.02, 0.9]} />
        </mesh>
      </group>

      {/* панель управления */}
      <group position={[0.42, 2.0, 0.76]} rotation-x={-0.55} {...hover('panel')}>
        <mesh position={[0, -0.06, -0.08]} material={plasticDark}>
          <boxGeometry args={[0.16, 0.06, 0.16]} />
        </mesh>
        <RoundedBox args={[0.56, 0.04, 0.34]} radius={0.015} material={plasticDark} castShadow>
          <Highlight on={active === 'panel'} />
        </RoundedBox>
        <mesh position={[-0.03, 0.021, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.44, 0.26]} />
          <meshBasicMaterial map={panelTex} toneMapped={false} />
        </mesh>
        <mesh ref={ledRef} position={[0.235, 0.025, 0.12]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial color={MINT} emissive={MINT} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
