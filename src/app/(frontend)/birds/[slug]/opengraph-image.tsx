import { ImageResponse } from 'next/og';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const alt = 'Bird Species';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Helper to convert lat/lng to tile coordinates
function lngLatToTile(lng, lat, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
  );
  return { x, y, z: zoom };
}

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

  // ─── Fetch bird species ─────────────────────────────────────
  const payload = await getPayload({ config: configPromise });

  const { docs: birds } = await payload.find({
    collection: 'birds',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });

  const bird = birds?.[0];

  if (!bird) {
    return new ImageResponse(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#fde047' }}>
        <span style={{ fontSize: 48, fontWeight: 900, color: '#000', fontFamily: '"Inter", sans-serif' }}>bird not found</span>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // ─── Fetch highest-rated bird photo ─────────────────────────
  const { docs: mediaItems } = await payload.find({
    collection: 'bird-media',
    where: { 
      and: [
        { species: { contains: bird.id } },
        { 'mimeType': { like: 'image/' } }
      ]
    },
    sort: '-rating',
    limit: 1,
    depth: 0,
  });

  const topMedia = mediaItems?.[0];
  const imageUrl = topMedia?.url
    ? topMedia.url.startsWith('http') ? topMedia.url : `${SITE_URL}${topMedia.url}`
    : null;

  // ─── Fetch checklists with coordinates ──────────────────────
  const { docs: checklists } = await payload.find({
    collection: 'bird-checklists',
    where: {
      'speciesRecords.bird': { equals: bird.id },
      latitude: { exists: true },
      longitude: { exists: true },
    },
    limit: 5,
    depth: 0,
  });

  const validChecklists = checklists.filter(
    (c) => typeof c.latitude === 'number' && typeof c.longitude === 'number'
  );

  // ─── Calculate map bounds and center ─────────────────────────
  let mapCenter = { lng: -98.5, lat: 29.3 };
  let zoom = 10;

  if (validChecklists.length > 0) {
    const lngs = validChecklists.map((c) => c.longitude);
    const lats = validChecklists.map((c) => c.latitude);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    mapCenter = {
      lng: (minLng + maxLng) / 2,
      lat: (minLat + maxLat) / 2,
    };

    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lngDiff, latDiff);
    zoom = Math.max(8, Math.floor(11 - Math.log2(maxDiff * 1.2)));
  }

  // ─── Build tile URLs for the map ─────────────────────────────
  const tileSize = 256;
  const mapWidth = 1200;
  const mapHeight = 630;
  const tilesX = Math.ceil(mapWidth / tileSize) + 1;
  const tilesY = Math.ceil(mapHeight / tileSize) + 1;

  const centerTile = lngLatToTile(mapCenter.lng, mapCenter.lat, zoom);

  const tileUrls = [];
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const x = centerTile.x - Math.floor(tilesX / 2) + tx;
      const y = centerTile.y - Math.floor(tilesY / 2) + ty;
      const url = `https://api.maptiler.com/maps/outdoor/${zoom}/${x}/${y}.png?key=${MAPTILER_KEY}`;
      tileUrls.push({ url, x, y, tx, ty });
    }
  }

  // ─── Build absolute logo URL ────────────────────────────────
  const logoUrl = `${SITE_URL}/media/cropped-because-birds-logo-bird-2.png`;

  // ─── Render OG image ────────────────────────────────────────
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
        {/* Map tiles background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
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

        {/* Overlay - lighter fade */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
          {/* Bird image circle */}
          {imageUrl && (
            <div style={{ 
              width: 300, 
              height: 300, 
              borderRadius: 140, 
              overflow: 'hidden', 
              border: '6px solid #ffffff', 
              boxShadow: '8px 8px 0px 0px #000000',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0,
              position: 'relative'
            }}>
              <img 
                src={imageUrl} 
                width={280} 
                height={280} 
                loading="eager"
                style={{ 
                  objectFit: 'cover', 
                  width: '100%', 
                  height: '100%',
                  display: 'block',
                  borderRadius: 140,
                }} 
              />
            </div>
          )}

          {/* Bird name label */}
          <div style={{ 
            marginTop: 28, 
            padding: '10px 36px 10px 16px', 
            backgroundColor: '#fde047', 
            border: '3px solid #000000', 
            borderRadius: 0, 
            boxShadow: '8px 8px 0px 0px #000000', 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 12,
          }}>
            {/* Rotated inner content (logo + text) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 12,
              transform: 'rotate(-3deg)',
            }}>
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
              <span style={{ fontSize: 50, fontWeight: 900, color: '#000000', fontFamily: '"Inter", sans-serif' }}>{bird.comName.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div style={{ position: 'absolute', bottom: 6, right: 12, fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'flex', zIndex: 10 }}>
          © MapTiler © OpenStreetMap contributors
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData ? [{ name: 'Inter', data: fontData, weight: 900, style: 'normal' }] : undefined,
    },
  );
}
