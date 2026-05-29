"use client"

import { motion } from "framer-motion"

function seeded(seed: number, min: number, max: number) {
  const s = Math.sin(seed * 9301 + 49297) * 233280
  return min + (s - Math.floor(s)) * (max - min)
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: seeded(i * 1.1, 0, 100),
  y: seeded(i * 2.3, 0, 100),
  size: seeded(i * 3.7, 0.5, 2),
  delay: seeded(i * 4.1, 0, 5),
  duration: seeded(i * 5.9, 10, 18),
}))

const COLORS = ["#F7BE4D", "#818cf8", "#34d399", "#ec4899"]

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.size,
            height: p.size,
            background: COLORS[p.id % 4],
          }}
          animate={{ y: [0, -50, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}
