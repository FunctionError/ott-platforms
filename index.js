addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const { pathname } = new URL(request.url)

    if (pathname === '/ns') {
      const nsM3U = await createNSPlayerM3U()
      return new Response(nsM3U, { headers: { 'Content-Type': 'application/json' } })
    } else if (pathname === '/ott') {
      const ottM3U = await createOTTNavM3U()
      return new Response(ottM3U, { headers: { 'Content-Type': 'text/plain' } })
    } else {
      return new Response('Toffee and Tsports marger . for ns player user /ns and for ott navigator usr /ott path', { status: 404 })
    }
  } catch (error) {
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 })
  }
}

async function fetchData(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`)
  }
  return response.json()
}

async function getCombinedChannelData() {
  const toffeeUrl = "https://raw.githubusercontent.com/Jeshan-akand/Toffee-Channels-Link-Headers/main/toffee_channel_data.json"
  const tsportsUrl = "https://raw.githubusercontent.com/byte-capsule/TSports-m3u8-Grabber/main/TSports_m3u8_headers.Json"

  const toffeeData = await fetchData(toffeeUrl)
  const tsportsData = await fetchData(tsportsUrl)

  const combinedChannelData = [...toffeeData.channels, ...tsportsData.channels]
  combinedChannelData.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  return combinedChannelData
}

async function createNSPlayerM3U() {
  const channels = await getCombinedChannelData()
  const nsPlayerData = channels.map(channel => ({
    "name": channel.name,
    "link": channel.link,
    "logo": channel.logo,
    "origin": channel.link.split("/")[2],
    "referrer": "PiratesTV",
    "userAgent": channel.userAgent || "",
    "cookie": channel.headers?.cookie || channel.headers.Cookie,
    "drmScheme": "",
    "drmLicense": ""
  }))
  return JSON.stringify(nsPlayerData, null, 2)
}

async function createOTTNavM3U() {
  const channels = await getCombinedChannelData()
  let ottNavData = "# This m3u presented by t.me/piratestv_updates\n# API from byte-capsule\n"
  channels.forEach((channel, i) => {
    ottNavData += `#EXTINF:-1 group-title="LIVE" tvg-chno="" tvg-id="" tvg-logo="${channel.logo}", ${channel.name}\n`
    ottNavData += `#EXTVLCOPT:http-user-agent=${channel.userAgent || ""}\n`
    const cookie = channel.headers?.cookie || channel.headers.Cookie
    ottNavData += `#EXTHTTP:{"cookie":"${cookie}"}\n`
    ottNavData += `${channel.link}\n`
  })
  return ottNavData
}
