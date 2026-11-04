'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const candies = [
  { image: '/assets/candies/candy-01-oval-black-burgundy.png', left: '7%', size: 104, delay: 0, tilt: -22 },
  { image: '/assets/candies/candy-02-amber-diamond.png', left: '17%', size: 90, delay: 80, tilt: 31 },
  { image: '/assets/candies/candy-03-moon-rectangle.png', left: '29%', size: 102, delay: 160, tilt: -39 },
  { image: '/assets/candies/candy-04-round-truffle.png', left: '40%', size: 82, delay: 30, tilt: 18 },
  { image: '/assets/candies/candy-05-striped-pillow.png', left: '51%', size: 108, delay: 220, tilt: -15 },
  { image: '/assets/candies/candy-06-long-caramel.png', left: '63%', size: 76, delay: 110, tilt: 42 },
  { image: '/assets/candies/candy-01-oval-black-burgundy.png', left: '73%', size: 94, delay: 260, tilt: -30 },
  { image: '/assets/candies/candy-04-round-truffle.png', left: '84%', size: 82, delay: 45, tilt: 26 },
  { image: '/assets/candies/candy-06-long-caramel.png', left: '94%', size: 70, delay: 190, tilt: -36 },
];

export function CandyRain() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('bonbons-candy-rain-seen')) return;
    sessionStorage.setItem('bonbons-candy-rain-seen', 'true');
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const hideTimer = window.setTimeout(() => setVisible(false), 2800);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);
  if (!visible) return null;
  return <div className="candy-rain" aria-hidden="true">{candies.map((candy, index) => <span key={index} style={{ '--candy-left': candy.left, '--candy-size': candy.size + 'px', '--candy-delay': candy.delay + 'ms', '--candy-tilt': candy.tilt + 'deg' } as React.CSSProperties}><Image src={candy.image} alt="" width={200} height={200} priority /></span>)}</div>;
}
