import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch the client's exact SVG file from Cloudflare R2
    const res = await fetch('https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon.svg', {
      next: { revalidate: 3600 } // Cache the response for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch the original R2 logo');
    }
    
    let svgText = await res.text();
    
    // Replace the original wide viewBox (0 572.25 1500 402) with a perfect 
    // square viewport focusing directly on the chameleon logo shape (centered at X=1293.75, Y=693.265)
    // This allows the browser to render the chameleon icon at 100% full tab square size, 
    // resolving the "too small/invisible" problem while preserving the original artwork.
    const originalViewBox = 'viewBox="0 572.2499744395 1500 401.999982044"';
    const squareViewBox = 'viewBox="1103.75 503.265 380 380"';
    
    if (svgText.includes(originalViewBox)) {
      svgText = svgText.replace(originalViewBox, squareViewBox);
    } else {
      // Fallback robust regex check in case spacing differs slightly
      svgText = svgText.replace(/viewBox="[^"]*"/, squareViewBox);
    }

    // Set first occurrence of width and height (on the root <svg> tag) to 100% 
    // to prevent the icon from being squished or distorted in the tab bar
    svgText = svgText.replace(/width="[^"]*"/, 'width="100%"');
    svgText = svgText.replace(/height="[^"]*"/, 'height="100%"');
    
    // Return with proper SVG header
    return new NextResponse(svgText, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error serving square favicon:', error);
    // If request fails, fallback gracefully to a standard brand colors chameleon SVG
    const backupSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="chameleonGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00b074" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <g transform="translate(48, 48) scale(0.82)">
    <path d="M 120,380 C 60,350 40,280 60,220 C 80,160 140,120 220,110 C 300,100 380,140 420,200 C 440,230 450,270 430,300 C 410,330 370,340 340,320 C 310,300 300,260 320,230 C 335,210 360,200 380,215 C 395,225 400,245 390,260 L 360,265" fill="none" stroke="url(#chameleonGrad)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 140,240 C 150,150 250,90 360,115 C 400,125 430,145 450,170 C 430,150 390,130 340,125 C 230,115 150,180 140,240 Z" fill="url(#chameleonGrad)" />
    <path d="M 360,115 C 380,115 410,120 440,100 C 450,95 460,110 455,120 C 445,140 450,165 465,180 C 480,195 485,220 470,240 C 455,260 420,270 390,250 Z" fill="url(#chameleonGrad)" />
    <circle cx="415" cy="175" r="28" fill="#121714" stroke="url(#chameleonGrad)" stroke-width="8" />
    <circle cx="415" cy="175" r="14" fill="url(#chameleonGrad)" />
    <circle cx="418" cy="172" r="5" fill="#ffffff" />
  </g>
</svg>`;
    return new NextResponse(backupSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
