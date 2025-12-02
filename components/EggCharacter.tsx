import React from 'react';
import { motion } from 'framer-motion';

interface EggCharacterProps {
  state: 'idle' | 'happy' | 'working' | 'worker' | 'eating' | 'rich';
}

const EggCharacter: React.FC<EggCharacterProps> = ({ state }) => {
  const isWorker = state === 'worker';
  const isEating = state === 'eating';
  const isRich = state === 'rich';
  
  // Determine animation behavior based on state
  let animateProps = {};
  let transitionProps = {};

  if (state === 'working' || isWorker) {
    animateProps = { rotate: [0, -5, 5, 0] };
    transitionProps = { repeat: Infinity, duration: 1, ease: "easeInOut" };
  } else if (isEating) {
    animateProps = { y: [0, 3, 0] }; // Gentle bouncing while sitting
    transitionProps = { repeat: Infinity, duration: 2, ease: "easeInOut" };
  } else if (isRich) {
    animateProps = { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }; // Confident pulsing
    transitionProps = { repeat: Infinity, duration: 2.5, ease: "easeInOut" };
  } else {
    animateProps = { y: [0, -10, 0] };
    transitionProps = { repeat: Infinity, duration: 3, ease: "easeInOut" };
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        animate={animateProps}
        transition={transitionProps}
      >
        {/* --- EATING MODE SCENE (Donut Chair) --- */}
        {isEating && (
          <g transform="translate(0, 40)">
             {/* Back of Donut */}
             <ellipse cx="100" cy="150" rx="80" ry="35" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
             <path d="M60 150 Q100 180 140 150" fill="none" stroke="#FBCFE8" strokeWidth="4" opacity="0.5" />
          </g>
        )}

        {/* --- RICH MODE SCENE (Coin Pile Background) --- */}
        {isRich && (
           <g transform="translate(0, 20)">
              <circle cx="40" cy="160" r="15" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
              <circle cx="160" cy="160" r="15" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
              <circle cx="20" cy="170" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              <circle cx="180" cy="170" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
              <path d="M0 180 L200 180 L200 200 L0 200 Z" fill="#FCD34D" />
           </g>
        )}

        {/* --- MAIN BODY --- */}
        {/* Adjust Y position if sitting */}
        <g transform={isEating ? "translate(0, 10)" : ""}>
            {/* Body Shape */}
            <ellipse cx="100" cy="110" rx="70" ry="85" fill="#FFFFFF" stroke="#333" strokeWidth="4" />
            
            {/* Pants/Suit */}
            {!isEating && (
              <path d="M45 140 Q100 170 155 140 L155 160 Q100 200 45 160 Z" fill={isWorker ? "#2563EB" : (isRich ? "#10B981" : "#374151")} />
            )}
            
            {/* Bowtie */}
            <path d="M85 145 L115 145 L100 155 Z" fill={isRich ? "#F59E0B" : "#EF4444"} />
            <circle cx="100" cy="148" r="5" fill={isRich ? "#F59E0B" : "#EF4444"} />

            {/* Face */}
            {isEating ? (
               // Happy closed eyes for eating
               <g>
                 <path d="M65 105 Q75 95 85 105" stroke="#333" strokeWidth="3" fill="none" />
                 <path d="M115 105 Q125 95 135 105" stroke="#333" strokeWidth="3" fill="none" />
               </g>
            ) : isRich ? (
               // Sunglasses for Rich Mode
               <g>
                  <path d="M55 95 L95 95 L95 115 Q75 125 55 115 Z" fill="#111827" stroke="#333" strokeWidth="2" />
                  <path d="M105 95 L145 95 L145 115 Q125 125 105 115 Z" fill="#111827" stroke="#333" strokeWidth="2" />
                  <line x1="95" y1="100" x2="105" y2="100" stroke="#111827" strokeWidth="3" />
                  {/* Glare */}
                  <path d="M60 100 L75 100" stroke="white" strokeWidth="2" opacity="0.5" />
                  <path d="M110 100 L125 100" stroke="white" strokeWidth="2" opacity="0.5" />
               </g>
            ) : (
               // Normal eyes
               <g>
                 <circle cx="75" cy="100" r="6" fill="#333" />
                 <circle cx="125" cy="100" r="6" fill="#333" />
               </g>
            )}
            
            {/* Blush */}
            <circle cx="65" cy="115" r="8" fill="#FCA5A5" opacity="0.6" />
            <circle cx="135" cy="115" r="8" fill="#FCA5A5" opacity="0.6" />

            {/* Mouth */}
            {state === 'idle' && (
              <path d="M90 110 Q100 115 110 110" stroke="#333" strokeWidth="3" fill="none" />
            )}
            {(state === 'happy' || state === 'working' || isWorker || isRich) && (
              <path d="M85 110 Q100 125 115 110" stroke="#333" strokeWidth="3" fill="none" />
            )}
            {isEating && (
               // Mouth around straw
               <circle cx="100" cy="120" r="4" fill="#333" />
            )}

            {/* Arms */}
            {isEating ? (
              // Holding Drink
              <g>
                <path d="M40 120 Q60 140 80 140" stroke="#333" strokeWidth="4" fill="none" />
                <path d="M160 120 Q140 140 120 140" stroke="#333" strokeWidth="4" fill="none" />
              </g>
            ) : isRich ? (
               // Holding a bag of money? Or just hands up celebrating
               <g>
                 <path d="M30 110 Q10 90 30 70" stroke="#333" strokeWidth="4" fill="none" />
                 <path d="M170 110 Q190 90 170 70" stroke="#333" strokeWidth="4" fill="none" />
                 {/* Money bills in hands */}
                 <rect x="15" y="55" width="25" height="15" fill="#10B981" stroke="#065F46" strokeWidth="1" transform="rotate(-10 27 62)" />
                 <rect x="160" y="55" width="25" height="15" fill="#10B981" stroke="#065F46" strokeWidth="1" transform="rotate(10 172 62)" />
               </g>
            ) : (
              // Normal Arms
              <g>
                <motion.path 
                    d="M30 110 Q10 130 30 150" 
                    stroke="#333" 
                    strokeWidth="4" 
                    fill="none"
                    animate={(state === 'working' || isWorker) ? { d: "M30 110 Q5 100 30 90" } : {}}
                />
                <motion.path 
                    d="M170 110 Q190 130 170 150" 
                    stroke="#333" 
                    strokeWidth="4" 
                    fill="none"
                    animate={(state === 'working' || isWorker) ? { d: "M170 110 Q195 100 170 90" } : {}}
                />
              </g>
            )}

            {/* Hard Hat (Worker Mode Only) */}
            {isWorker && (
              <g>
                <path d="M50 80 Q100 20 150 80" fill="#F59E0B" stroke="#333" strokeWidth="4" />
                <path d="M40 80 L160 80" stroke="#333" strokeWidth="4" fill="none" />
                <circle cx="100" cy="65" r="8" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
              </g>
            )}

            {/* Antenna (Default/Eating/Rich) */}
            {!isWorker && (
              <g>
                <path d="M100 25 Q90 15 80 25" stroke="#FCD34D" strokeWidth="4" fill="none" />
                <circle cx="100" cy="25" r="8" fill="#FCD34D" stroke="#333" strokeWidth="2" />
              </g>
            )}
        </g>

        {/* --- EATING PROPS (Foreground) --- */}
        {isEating && (
           <g transform="translate(0, 40)">
              {/* Front of Donut */}
              <path d="M20 150 Q100 185 180 150" fill="none" stroke="#F472B6" strokeWidth="20" strokeLinecap="round" />
              {/* Sprinkles */}
              <line x1="50" y1="150" x2="55" y2="155" stroke="#FFF" strokeWidth="3" />
              <line x1="80" y1="160" x2="85" y2="158" stroke="#FEF08A" strokeWidth="3" />
              <line x1="120" y1="162" x2="125" y2="165" stroke="#BFDBFE" strokeWidth="3" />
              <line x1="150" y1="152" x2="155" y2="150" stroke="#FFF" strokeWidth="3" />

              {/* Boba Tea Cup */}
              <g transform="translate(85, 80)">
                 {/* Straw */}
                 <line x1="15" y1="0" x2="15" y2="40" stroke="#333" strokeWidth="3" />
                 {/* Cup Body */}
                 <path d="M5 40 L10 80 L20 80 L25 40 Z" fill="#FDBA74" stroke="#333" strokeWidth="2" />
                 {/* Lid */}
                 <path d="M5 40 L25 40" stroke="#333" strokeWidth="2" />
                 {/* Pearls */}
                 <circle cx="12" cy="70" r="2" fill="#333" />
                 <circle cx="18" cy="75" r="2" fill="#333" />
                 <circle cx="15" cy="65" r="2" fill="#333" />
              </g>
           </g>
        )}
      </motion.svg>
      
      {/* Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/20 blur-md rounded-full" />
    </div>
  );
};

export default EggCharacter;