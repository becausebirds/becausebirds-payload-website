import { isPayloadUserAuthenticated } from '@/lib/auth-check'

export default async function PlausibleAnalytics() {
  const isAuthenticated = await isPayloadUserAuthenticated()

  // Don't load analytics for logged-in Payload users
  if (isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Plausible Analytics (tagged-events + outbound-links) */}
      <script
        defer
        data-domain="becausebirds.com"
        src="https://metrics.becausebirds.com/js/script.tagged-events.outbound-links.js"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
        }}
      />

      {/* Privacy-friendly analytics by Plausible (PA tag) */}
      <script
        async
        src="https://metrics.becausebirds.com/js/pa-0x7cC2UP7PJ-dvQ0KTwdv.js"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};
            plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init()
          `,
        }}
      />
    </>
  )
}
