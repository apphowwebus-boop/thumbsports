import React, { useEffect, useState } from 'react';
import { getThumbLogoAssets } from '../utils/garmentTexture';

interface ThumbLogoProps {
  variant?: 'dark' | 'light';
  compact?: boolean;
  className?: string;
}

export const ThumbLogo: React.FC<ThumbLogoProps> = ({
  variant = 'dark',
  compact = false,
  className = '',
}) => {
  const [emblemUrl, setEmblemUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    getThumbLogoAssets()
      .then((assets) => {
        if (!cancelled) setEmblemUrl(assets.emblemUrl);
      })
      .catch(() => {
        // Fallback SVG emblem renders seamlessly if needed
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const subTextClass = variant === 'dark' ? 'text-neutral-600' : 'text-neutral-400';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {emblemUrl ? (
        <img
          src={emblemUrl}
          alt="Thumb Sports Industries crest"
          referrerPolicy="no-referrer"
          className={`${compact ? 'w-9 h-9' : 'w-11 h-11'} object-contain shrink-0`}
        />
      ) : (
        <svg
          width={compact ? 34 : 42}
          height={compact ? 34 : 42}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <ellipse cx="20" cy="20" rx="17" ry="13" transform="rotate(-18 20 20)" stroke="#D97706" strokeWidth="3" />
          <path d="M12 15H26L23 19H19.5L17 27H13.5L16 19H10.5L12 15Z" fill="#D97706" />
        </svg>
      )}

      <span className="flex flex-col leading-none text-left">
        <span
          className={`font-display font-bold tracking-tight uppercase whitespace-nowrap ${
            compact ? 'text-xl' : 'text-2xl'
          } ${variant === 'dark' ? 'text-[#111214]' : 'text-[#F8F7F4]'}`}
        >
          Thumb Sports Industries
        </span>
        {!compact && (
          <span className={`font-mono text-[9px] uppercase tracking-[0.18em] mt-0.5 whitespace-nowrap ${subTextClass}`}>
            Sportswear · Streetwear · Combat Mfg.
          </span>
        )}
      </span>
    </span>
  );
};
