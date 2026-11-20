import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * Three hand-built skyline layers (far haze, mid city with chimneys and a
 * crane, near rooftops) drifting at different scroll speeds. No stock art.
 */
export default function Skyline() {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const speed = (distance) => [0, reduceMotion ? 0 : distance];
  const farY = useTransform(scrollY, [0, 1000], speed(60));
  const midY = useTransform(scrollY, [0, 1000], speed(150));
  const nearY = useTransform(scrollY, [0, 1000], speed(260));
  const hazeY = useTransform(scrollY, [0, 1000], speed(30));

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[74vh] min-h-[440px] overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        style={{ y: hazeY }}
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#241f19]/80 via-[#5b4c3b]/25 to-transparent blur-2xl"
      />

      {/* far layer + sun */}
      <motion.svg
        style={{ y: farY }}
        className="absolute inset-x-0 bottom-0 h-[62vh] w-full"
        viewBox="0 0 1440 380"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="farFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d4653" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1d222b" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#e8a33d" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#e8a33d" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#e8a33d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="1040" cy="150" r="190" fill="url(#sunGlow)" />
        <circle cx="1040" cy="152" r="58" fill="#e8a33d" opacity="0.4" />

        <g fill="url(#farFade)">
          <rect x="0" y="252" width="70" height="128" />
          <rect x="80" y="212" width="42" height="168" />
          <rect x="132" y="272" width="62" height="108" />
          <rect x="204" y="182" width="54" height="198" />
          <rect x="268" y="232" width="82" height="148" />
          <rect x="360" y="262" width="46" height="118" />
          <rect x="414" y="90" width="16" height="290" />
          <rect x="440" y="152" width="72" height="228" />
          <rect x="520" y="232" width="42" height="148" />
          <rect x="572" y="198" width="66" height="182" />
          <rect x="648" y="252" width="58" height="128" />
          <rect x="716" y="172" width="82" height="208" />
          <rect x="808" y="242" width="46" height="138" />
          <rect x="864" y="212" width="62" height="168" />
          <rect x="936" y="272" width="52" height="108" />
          <rect x="998" y="188" width="76" height="192" />
          <rect x="1084" y="248" width="56" height="132" />
          <rect x="1150" y="204" width="46" height="176" />
          <rect x="1206" y="258" width="66" height="122" />
          <rect x="1282" y="178" width="52" height="202" />
          <rect x="1344" y="232" width="96" height="148" />
        </g>
      </motion.svg>

      {/* mid layer */}
      <motion.svg
        style={{ y: midY }}
        className="absolute inset-x-0 bottom-0 h-[52vh] w-full"
        viewBox="0 0 1440 380"
        preserveAspectRatio="xMidYMax slice"
      >
        <g fill="#3f372d" opacity="0.92">
          <rect x="-20" y="292" width="184" height="90" />
          <rect x="142" y="240" width="82" height="142" />
          <rect x="212" y="320" width="132" height="62" />
          <rect x="300" y="190" width="20" height="192" />
          <rect x="362" y="270" width="62" height="112" />
          <rect x="432" y="330" width="152" height="52" />
          <rect x="470" y="140" width="28" height="242" />
          <rect x="622" y="296" width="92" height="86" />
          <rect x="742" y="252" width="56" height="130" />
          <rect x="832" y="316" width="132" height="66" />
          <rect x="992" y="276" width="70" height="106" />
          <rect x="1092" y="320" width="142" height="62" />
          <rect x="1210" y="168" width="24" height="214" />
          <rect x="1262" y="252" width="86" height="130" />
          <rect x="1362" y="300" width="120" height="82" />
        </g>

        {/* crane */}
        <g stroke="#3f372d" strokeWidth="4" fill="none" opacity="0.9">
          <line x1="1088" y1="380" x2="1088" y2="152" />
          <line x1="1012" y1="164" x2="1166" y2="164" />
          <line x1="1088" y1="152" x2="1166" y2="164" />
          <line x1="1132" y1="164" x2="1132" y2="238" />
        </g>
        <rect x="1122" y="238" width="20" height="16" fill="#3f372d" opacity="0.9" />

        {/* plumes */}
        <g stroke="#cbbca6" fill="none" strokeLinecap="round" opacity="0.13">
          <path d="M484 132 C 466 104, 506 88, 490 56 C 478 32, 512 22, 504 2" strokeWidth="12" />
          <path d="M310 178 C 296 150, 330 132, 316 104 C 306 82, 334 74, 328 54" strokeWidth="8" />
          <path d="M1222 160 C 1208 132, 1244 118, 1230 92" strokeWidth="9" />
        </g>
      </motion.svg>

      {/* near rooftops */}
      <motion.svg
        style={{ y: nearY }}
        className="absolute inset-x-0 bottom-0 h-[34vh] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMax slice"
      >
        <g fill="#0a0c10">
          <rect x="0" y="140" width="300" height="80" />
          <rect x="24" y="118" width="46" height="22" />
          <rect x="150" y="106" width="70" height="34" />
          <rect x="1128" y="150" width="320" height="70" />
          <rect x="1290" y="124" width="52" height="26" />
          <rect x="1190" y="132" width="34" height="18" />
        </g>
        <g fill="#0a0c10" opacity="0.9">
          <rect x="330" y="192" width="90" height="28" />
          <rect x="1010" y="196" width="90" height="24" />
        </g>
      </motion.svg>
    </div>
  );
}
