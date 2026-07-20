import { ImageResponse } from 'next/og';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const alt = 'Bird Checklist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const MAPTILER_KEY = process.env.MAPTILER_KEY;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // ─── Load font ──────────────────────────────────────────────
  const fontData = await fetch(
    'https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap',
  )
    .then((r) => r.text())
    .then((css) => {
      const url = css.match(/src: url\((.+?)\)/)?.[1];
      if (!url) return null;
      return fetch(url).then((r) => r.arrayBuffer());
    });

  // ─── Fetch checklist ──────────────────────────────────────
  const payload = await getPayload({ config: configPromise });

  const { docs: checklists } = await payload.find({
    collection: 'bird-checklists',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const checklist = checklists?.[0];

  if (!checklist) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#fde047',
        }}
      >
        <span style={{ fontSize: 48, fontWeight: 900, color: '#000', fontFamily: '"Inter", sans-serif' }}>
          checklist not found
        </span>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // ─── Format date ─────────────────────────────────────────────
const rawDate = checklist.date ?? ''
const formattedDate = rawDate
  ? new Date(rawDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  : 'Unknown Date'


  // ─── General map tiles (fixed scenic center — no specific area) ─
  const center = { lng: -98.5, lat: 35.0 };
  const zoom = 5;
  const tileSize = 256;
  const mapWidth = 1200;
  const mapHeight = 630;
  const tilesX = Math.ceil(mapWidth / tileSize) + 1;
  const tilesY = Math.ceil(mapHeight / tileSize) + 1;

  const n = Math.pow(2, zoom);
  const centerTileX = Math.floor(((center.lng + 180) / 360) * n);
  const centerTileY = Math.floor(
    ((1 -
      Math.log(
        Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      n
  );

  const tileUrls = [];
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const x = centerTileX - Math.floor(tilesX / 2) + tx;
      const y = centerTileY - Math.floor(tilesY / 2) + ty;
      tileUrls.push({
        url: `https://api.maptiler.com/maps/outdoor/${zoom}/${x}/${y}.png?key=${MAPTILER_KEY}`,
        tx,
        ty,
      });
    }
  }

  // ─── Build absolute logo URL ─────────────────────────────────
  const logoUrl = `${SITE_URL}/media/cropped-because-birds-logo-bird-2.png`;

  // ─── Render OG image ─────────────────────────────────────────
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: '#e0e0e0',
          overflow: 'hidden',
        }}
      >
        {/* Map tiles background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            flexWrap: 'wrap',
            overflow: 'hidden',
          }}
        >
          {tileUrls.map((tile, idx) => (
            <img
              key={idx}
              src={tile.url}
              width={256}
              height={256}
              loading="eager"
              style={{
                position: 'absolute',
                left: tile.tx * 256,
                top: tile.ty * 256,
                width: 256,
                height: 256,
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          {/* Checklist label */}
          <div
            style={{
              padding: '10px 36px 10px 16px',
              backgroundColor: '#fde047',
              border: '3px solid #000000',
              borderRadius: 0,
              boxShadow: '8px 8px 0px 0px #000000',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                transform: 'rotate(-3deg)',
              }}
            >
              <img
                src={logoUrl}
                width={110}
                height={100}
                loading="eager"
                style={{
                  display: 'block',
                  flexShrink: 0,
                  marginTop: -44,
                  marginBottom: -6,
                  marginLeft: -8,
                }}
              />
              <span
                style={{
                  fontSize: 50,
                  fontWeight: 900,
                  color: '#000000',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                bird checklist from {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 12,
            fontSize: 10,
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            zIndex: 10,
          }}
        >
          © MapTiler © OpenStreetMap contributors
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: 'Inter', data: fontData, weight: 900, style: 'normal' }]
        : undefined,
    }
  );
}
