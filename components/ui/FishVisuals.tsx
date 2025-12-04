
import React from 'react';

export const SardineVisual = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
        <g transform="translate(10, 20)">
            <path d="M5 10 Q 25 0, 45 10 Q 25 20, 5 10 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <path d="M5 10 Q 15 5, 25 10" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
            <path d="M45 10 L 55 5 L 55 15 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1">
                <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    values="-5 15 15; 5 15 15; -5 15 15" 
                    dur="0.4s" 
                    repeatCount="indefinite" 
                />
            </path>
            <circle cx="10" cy="9" r="1.5" fill="black" />
            <circle cx="11" cy="8" r="0.5" fill="white" />
        </g>
    </svg>
);

export const TunaVisual = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
        <g transform="translate(2, 16) scale(1.2)">
            <path d="M20 10 L 25 2 L 30 10 Z" fill="#1e3a8a" />
            <path d="M2 15 Q 25 -5, 48 15 Q 25 35, 2 15 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <path d="M2 15 Q 25 5, 48 15" fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.3" />
            <path d="M48 15 L 56 6 L 54 15 L 56 24 Z" fill="#1e3a8a" stroke="#1e40af" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" values="-8 48 15; 8 48 15; -8 48 15" dur="0.25s" repeatCount="indefinite" />
            </path>
            <circle cx="10" cy="13" r="2.5" fill="white" stroke="#1e3a8a" strokeWidth="1" />
            <circle cx="10" cy="13" r="1" fill="black" />
        </g>
    </svg>
);

export const KoiVisual = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
        <g transform="translate(5, 18)">
            <path d="M15 15 L 12 22 L 20 20 Z" fill="#fff" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" values="-10 15 15; 10 15 15; -10 15 15" dur="0.8s" repeatCount="indefinite" />
            </path>
             <path d="M30 15 L 35 24 L 25 24 Z" fill="#fff" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" values="-10 30 15; 10 30 15; -10 30 15" dur="0.8s" repeatCount="indefinite" begin="0.4s" />
            </path>
            <path d="M5 12 Q 25 0, 45 12 Q 25 24, 5 12 Z" fill="#ffffff" stroke="#fb923c" strokeWidth="1" />
            <circle cx="15" cy="10" r="4" fill="#f97316" />
            <circle cx="28" cy="14" r="3" fill="#f97316" />
            <circle cx="38" cy="10" r="2" fill="#000" />
            <path d="M45 12 Q 55 5, 58 2 Q 55 12, 58 22 Q 55 19, 45 12 Z" fill="#fff" stroke="#fb923c" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" values="-15 45 12; 15 45 12; -15 45 12" dur="0.6s" repeatCount="indefinite" />
            </path>
             <circle cx="10" cy="10" r="1.5" fill="black" />
        </g>
    </svg>
);

export const GoldenCarpVisual = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
        <circle cx="32" cy="32" r="25" fill="url(#glowGradient)" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
        <defs>
            <radialGradient id="glowGradient">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="transparent" />
            </radialGradient>
        </defs>

        <g transform="translate(5, 15)">
            <path d="M15 8 L 35 2 L 35 8 Z" fill="#eab308" />
            <path d="M2 15 Q 25 -5, 48 15 Q 25 35, 2 15 Z" fill="#facc15" stroke="#a16207" strokeWidth="1" />
            <path d="M15 10 Q 18 15, 15 20 M 22 8 Q 25 15, 22 22 M 29 8 Q 32 15, 29 22" stroke="#d97706" fill="none" opacity="0.5" />
            <path d="M2 15 Q -5 10, -8 18" stroke="#facc15" fill="none" strokeWidth="1.5" />
            <path d="M2 15 Q -5 20, -8 12" stroke="#facc15" fill="none" strokeWidth="1.5" />
            <path d="M48 15 L 60 5 L 56 15 L 60 25 Z" fill="#eab308" stroke="#a16207" strokeWidth="1">
                 <animateTransform attributeName="transform" type="rotate" values="-10 48 15; 10 48 15; -10 48 15" dur="0.5s" repeatCount="indefinite" />
            </path>
             <circle cx="8" cy="13" r="2" fill="black" />
             <circle cx="9" cy="12" r="0.8" fill="white" />
        </g>
    </svg>
);

export const BootVisual = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
        <g transform="translate(14, 10)">
            <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0 0; 0 -2; 0 0" 
                dur="2s" 
                repeatCount="indefinite" 
            />
            <path d="M10 2 L 30 2 L 30 25 Q 30 35, 40 35 L 45 35 Q 50 35, 50 45 L 50 50 L 10 50 L 10 2 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <rect x="8" y="50" width="44" height="6" fill="#1c1917" />
            <path d="M15 10 L 25 10 M 15 15 L 25 15 M 15 20 L 25 20" stroke="#d6d3d1" strokeWidth="2" />
            <circle cx="20" cy="30" r="4" fill="#a8a29e" opacity="0.5" />
            <path d="M40 50 Q 40 55, 40 58 Q 40 60, 42 60" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6">
                 <animate attributeName="d" values="M40 50 Q 40 55, 40 58; M40 50 Q 40 60, 40 65" dur="1s" repeatCount="indefinite" />
                 <animate attributeName="opacity" values="0.6; 0" dur="1s" repeatCount="indefinite" />
            </path>
        </g>
    </svg>
);

export const TinCanVisual = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
        <g transform="translate(16, 10)">
             <animateTransform 
                attributeName="transform" 
                type="translate" 
                values="0 0; 0 -2; 0 0" 
                dur="2s" 
                repeatCount="indefinite" 
            />
            <path d="M5 10 L 5 40 Q 5 45, 17 45 Q 29 45, 29 40 L 29 10" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
            <ellipse cx="17" cy="10" rx="12" ry="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <path d="M10 8 L 24 6" stroke="#475569" strokeWidth="2" />
            <path d="M6 15 L 28 15 L 28 30 L 20 28 L 15 32 L 6 30 Z" fill="#ef4444" opacity="0.8" />
            <text x="10" y="25" fontSize="8" fill="white" fontWeight="bold">FISH</text>
            <circle cx="10" cy="38" r="2" fill="#7c2d12" opacity="0.6" />
            <circle cx="25" cy="12" r="1.5" fill="#7c2d12" opacity="0.6" />
        </g>
    </svg>
);
