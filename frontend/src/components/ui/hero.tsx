import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useNavigate } from "react-router-dom"
import { SonarGrid } from "@/components/ui/sonar-grid"
import { Liquid } from "@/components/ui/button-1"

const COLORS = {
  color1: '#FFFFFF',
  color2: '#1E10C5',
  color3: '#9089E2',
  color4: '#FCFCFE',
  color5: '#F9F9FD',
  color6: '#B2B8E7',
  color7: '#0E2DCB',
  color8: '#0017E9',
  color9: '#4743EF',
  color10: '#7D7BF4',
  color11: '#0B06FC',
  color12: '#C5C1EA',
  color13: '#1403DE',
  color14: '#B6BAF6',
  color15: '#C1BEEB',
  color16: '#290ECB',
  color17: '#3F4CC0',
};

const settings = {
  ringWidth: 90,
  speed: 260,
  amplitude: 2.2,
  pingEvery: 2.4,
  interactive: true,
  spacing: 26,
  baseOpacity: 0.28,
  useThemeColor: true,
  color: "#f5d74e",
  subline: "Peer-to-peer video calling for up to 5 people. Tap anywhere to send a ping.",
}

export default function Hero(props: Partial<typeof settings>) {
  const s = { ...settings, ...props }
  const reduce = useReducedMotion()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
        initial: { opacity: 0, y: 14, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <SonarGrid
      id="sonar-grid-demo"
      ringWidth={s.ringWidth}
      speed={s.speed}
      amplitude={s.amplitude}
      pingEvery={s.pingEvery}
      interactive={s.interactive}
      spacing={s.spacing}
      baseOpacity={s.baseOpacity}
      color={s.useThemeColor ? undefined : s.color}
      pingArea={[0.22, 0.18, 0.78, 0.82]}
      className="bg-background flex min-h-[max(560px,100svh)] w-full flex-col text-white"
    >
      <div className="absolute top-6 right-8 z-[100]">
        <button
          onClick={() => {
            document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="text-black bg-white hover:bg-neutral-200 transition-all duration-300 rounded-full px-6 py-2.5 font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95"
        >
          About
        </button>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_34%_30%_at_50%_50%,var(--color-background)_0%,transparent_100%)]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-8 py-24 text-center z-10">
        <div className="flex max-w-2xl flex-col items-center">
          <motion.h1
            {...enter(0.08)}
            className="text-white text-5xl font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl flex flex-col items-center gap-2"
          >
            <div className="flex justify-center mb-[-20px] mt-[-20px]">
              <img
                src="/xlink-signature.png"
                alt="XLink"
                width={480}
                height={176}
                style={{ filter: "drop-shadow(0 0 4px rgba(245, 212, 59, 0.4))" }}
                className="block"
              />
            </div>
            <span className="text-3xl md:text-5xl opacity-90">WebRTC</span>
          </motion.h1>
          <motion.p {...enter(0.16)} className="text-white/70 mt-6 max-w-xl text-base text-pretty sm:text-lg">
            {s.subline}
          </motion.p>
          <motion.div {...enter(0.24)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/room")}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative inline-block w-48 sm:w-64 h-[3.5em] mx-auto group dark:bg-black bg-white dark:border-white border-black border-2 rounded-lg cursor-pointer transition-transform active:scale-95"
            >
              <div className="absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 filter blur-[19px] opacity-70">
                <span className="absolute inset-0 rounded-lg bg-[#d9d9d9] filter blur-[6.5px]"></span>
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <Liquid isHovered={isHovered} colors={COLORS} />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-lg bg-[#010128] filter blur-[7.3px]"></div>
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <span className="absolute inset-0 rounded-lg bg-[#d9d9d9]"></span>
                <span className="absolute inset-0 rounded-lg bg-black"></span>
                <Liquid isHovered={isHovered} colors={COLORS} />
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`absolute inset-0 rounded-lg border-solid border-[3px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[4px]'}`}
                  ></span>
                ))}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-lg filter blur-[15px] bg-[#006]"></span>
              </div>
              <span className="absolute inset-0 flex items-center justify-center rounded-lg group-hover:text-yellow-400 text-white text-[15px] font-semibold tracking-wide z-10 pointer-events-none gap-2">
                Join a Room
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </SonarGrid>
  )
}
