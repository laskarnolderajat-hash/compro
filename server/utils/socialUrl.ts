export interface ParsedSocialUrl {
  platform: 'instagram' | 'tiktok'
  url: string
  postId: string
}

const IG_HOSTS = ['instagram.com', 'www.instagram.com']
const TIKTOK_HOSTS = ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com']
const TIKTOK_SHORT_HOSTS = ['vm.tiktok.com', 'vt.tiktok.com']

function bad(pesan: string): never {
  throw createError({ statusCode: 400, message: pesan })
}

/**
 * Mengenali URL post Instagram/TikTok dan membuang parameter share
 * (?igsh=..., ?is_from_webapp=...) supaya URL yang disimpan stabil.
 * Link pendek TikTok (vm./vt.) diikuti redirect-nya dulu.
 */
export async function parseSocialUrl(input: string): Promise<ParsedSocialUrl> {
  const raw = input?.trim()
  if (!raw) bad('URL post wajib diisi.')

  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return bad('URL tidak valid. Salin link post langsung dari aplikasinya.')
  }

  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    bad('URL harus diawali http:// atau https://')
  }

  const host = u.hostname.toLowerCase()

  if (TIKTOK_SHORT_HOSTS.includes(host)) {
    u = new URL(await resolveShortLink(u.toString()))
  }

  const finalHost = u.hostname.toLowerCase()

  if (IG_HOSTS.includes(finalHost)) {
    // /p/<kode>/ (post) atau /reel/<kode>/ (reel)
    const m = u.pathname.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/)
    if (!m) bad('Link Instagram harus menuju satu post atau reel, misal instagram.com/p/XXXX/ atau /reel/XXXX/')
    return {
      platform: 'instagram',
      url: `https://www.instagram.com/${m[1]}/${m[2]}/`,
      postId: m[2]!,
    }
  }

  if (TIKTOK_HOSTS.includes(finalHost)) {
    const m = u.pathname.match(/\/@([^/]+)\/video\/(\d+)/)
    if (!m) bad('Link TikTok harus menuju satu video, misal tiktok.com/@akun/video/123456')
    return {
      platform: 'tiktok',
      url: `https://www.tiktok.com/@${m[1]}/video/${m[2]}`,
      postId: m[2]!,
    }
  }

  return bad('Hanya link Instagram dan TikTok yang didukung.')
}

/** Link pendek TikTok cuma redirect — ikuti sekali untuk dapat URL aslinya. */
async function resolveShortLink(url: string) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } })
    return res.url || url
  } catch {
    return bad('Link pendek TikTok tidak bisa dibuka. Coba salin link lengkapnya dari aplikasi TikTok.')
  }
}

export interface OembedMeta {
  thumbnailUrl?: string
  authorName?: string
  caption?: string
}

/**
 * TikTok punya oEmbed publik tanpa API key, jadi metadatanya bisa diambil
 * otomatis. Instagram tidak — oEmbed-nya butuh token app Meta — jadi untuk IG
 * metadata diisi admin lewat form. Kegagalan di sini tidak fatal: post tetap
 * bisa disimpan, hanya tanpa thumbnail.
 */
export async function fetchTiktokMeta(url: string): Promise<OembedMeta> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return {}
    const data = await res.json() as Record<string, string>
    return {
      thumbnailUrl: data.thumbnail_url,
      authorName: data.author_name,
      caption: data.title,
    }
  } catch {
    return {}
  }
}
