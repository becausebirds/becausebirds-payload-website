import { ImageResponse } from 'next/og';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const alt = 'Bird Species';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
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
    where: { slug: { equals: params.slug } },
    limit: 1,
    depth: 0,
  });

  const bird = birds?.[0];
  if (!bird) {
    return new ImageResponse(
      (
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
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#000',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Bird Not Found
          </span>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData
          ? [{ name: 'Inter', data: fontData, weight: 900, style: 'normal' }]
          : undefined,
      },
    );
  }

  // ─── Fetch highest-rated bird photo ─────────────────────────
  const { docs: mediaItems } = await payload.find({
    collection: 'bird-media',
    where: { species: { contains: bird.id } },
    sort: '-rating',
    limit: 1,
    depth: 0,
  });

  const topMedia = mediaItems?.[0];
  const imageUrl = topMedia?.url
    ? topMedia.url.startsWith('http')
      ? topMedia.url
      : `${SITE_URL}${topMedia.url}`
    : null;

  // ─── Fetch checklists with coordinates for this species ─────
  const { docs: checklists } = await payload.find({
    collection: 'bird-checklists',
    where: {
      AND: [
        { 'speciesRecords.bird': { equals: bird.id } },
        { latitude: { not_equals: null } },
        { longitude: { not_equals: null } },
      ],
    },
    limit: 30,
    depth: 0,
  });

  const coords = checklists.filter(
    (c): c is { latitude: number; longitude: number } & typeof c =>
      typeof c.latitude === 'number' && typeof c.longitude === 'number',
  );

  // ─── Build MapTiler static map URL ──────────────────────────
  let mapUrl: string;

  if (coords.length > 0) {
    // Calculate center point (average of all coordinates)
    const centerLat =
      coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
    const centerLng =
      coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
    const zoom = coords.length === 1 ? 9 : coords.length <= 3 ? 6 : 4;

    // Build marker pins - MapTiler uses pin-m+hexcolor(Lng,Lat) syntax
    const markers = coords
      .map((c) => `pin-m+eb4a4a(${c.longitude.toFixed(5)},${c.latitude.toFixed(5)})`)
      .join(',');

    mapUrl = `https://api.maptiler.com/maps/outdoor/static/${markers}/${centerLng.toFixed(5)},${centerLat.toFixed(5)},${zoom}/1200x630@2x.png?key=${MAPTILER_KEY}`;
  } else {
    // Fallback: broad world view
    mapUrl = `https://api.maptiler.com/maps/outdoor/static/0,20,2/1200x630@2x.png?key=${MAPTILER_KEY}`;
  }

  // ─── Render OG image ────────────────────────────────────────
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
          backgroundImage: `url(${mapUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Dark gradient overlay for readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.50) 100%)',
          }}
        />

        {/* Bird photo in a circle */}
        {imageUrl && (
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '5px solid #ffffff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              zIndex: 1,
              display: 'flex',
            }}
          >
            <img
              src={imageUrl}
              width={260}
              height={260}
              style={{ objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Species name — navbar style (yellow bg + black shadow + bold text) */}
        <div
          style={{
            marginTop: 24,
            padding: '14px 36px',
            backgroundColor: '#fde047',    // tailwind bg-yellow-300
            border: '3px solid #000000',
            borderRadius: 8,
            boxShadow: '8px 8px 0px 0px #000000',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: '#000000',
              letterSpacing: '-0.025em',   // tracking-tight
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {bird.comName}
          </span>
        </div>

        {/* Map attribution (required for MapTiler/OSM) */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 12,
            fontSize: 10,
            color: 'rgba(255,255,255,0.6)',
            zIndex: 1,
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
    },
  );
}
