export default {
  async fetch(request) {
    const url = new URL(request.url)

    // Canonical host: apex -> www (preserve path + query)
    if (url.hostname === 'myfoodsorted.com') {
      url.hostname = 'www.myfoodsorted.com'
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }

    if (!url.pathname.startsWith('/share/')) {
      return fetch(request)
    }

    const backendUrl = new URL(request.url)
    backendUrl.hostname = 'my-food-sorted-production.up.railway.app'
    backendUrl.protocol = 'https:'

    const headers = new Headers(request.headers)
    headers.set('x-forwarded-host', request.headers.get('host') || '')
    headers.set('x-forwarded-proto', url.protocol.replace(':', '') || 'https')

    const isBodyAllowed = request.method !== 'GET' && request.method !== 'HEAD'

    const response = await fetch(backendUrl.toString(), {
      method: request.method,
      headers,
      body: isBodyAllowed ? request.body : undefined,
      redirect: 'follow',
    })

    const next = new Response(response.body, response)
    next.headers.set('x-share-proxy', 'soft-term-7b46')
    return next
  },
}
