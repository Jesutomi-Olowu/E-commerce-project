// Pixel spark traced by eye from the identity board. Replace with the approved vector artwork for production.
export function Spark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} fill="#EFFF72" aria-hidden="true">
      <rect x="63" y="0" width="30" height="60" />
      <rect x="0" y="62" width="58" height="32" />
      <rect x="127" y="44" width="28" height="28" />
      <rect x="93" y="68" width="30" height="30" />
      <rect x="67" y="96" width="26" height="30" />
      <rect x="40" y="126" width="30" height="30" />
      <rect x="107" y="114" width="46" height="46" />
    </svg>
  );
}

export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      goodbyte
      <Spark size={Math.round(size / 2)} />
    </span>
  );
}
