'use client';

// Maps team ISO codes to flag emoji or API logo URLs
// Uses flagcdn.com for reliable flag images

const ISO_TO_COUNTRY_CODE: Record<string, string> = {
  BRA: 'br', JPN: 'jp', CIV: 'ci', NOR: 'no',
  MEX: 'mx', ECU: 'ec', ENG: 'gb-eng', COD: 'cd',
  ARG: 'ar', CPV: 'cv', AUS: 'au', EGY: 'eg',
  CHE: 'ch', DZA: 'dz', COL: 'co', GHA: 'gh',
  SEN: 'sn', BEL: 'be', USA: 'us', BIH: 'ba',
  ESP: 'es', AUT: 'at', PRT: 'pt', HRV: 'hr',
  NLD: 'nl', MAR: 'ma', CAN: 'ca', ZAF: 'za',
  FRA: 'fr', SWE: 'se', DEU: 'de', PRY: 'py',
  TUN: 'tn', QAT: 'qa', SCO: 'gb-sct', HTI: 'ht',
  TUR: 'tr', KOR: 'kr', SAU: 'sa', URY: 'uy',
  NZL: 'nz', IRN: 'ir', IRQ: 'iq', JOR: 'jo',
  UZB: 'uz', PAN: 'pa',
};

interface TeamFlagProps {
  isoCode: string;
  size?: number;
  className?: string;
}

export function TeamFlag({ isoCode, size = 28, className = '' }: TeamFlagProps) {
  const countryCode = ISO_TO_COUNTRY_CODE[isoCode.toUpperCase()] ?? isoCode.toLowerCase();
  const src = `https://flagcdn.com/w40/${countryCode}.png`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={isoCode}
      width={size}
      height={Math.round(size * 0.67)}
      className={`object-cover ${className}`}
      style={{ borderRadius: '2px' }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
