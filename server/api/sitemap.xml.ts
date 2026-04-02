export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = 'https://blrssco.com'
  
  // 基础静态页面（不包含prefix页面）
  const staticRoutes = [
    '/',
    '/contact',
    '/privacy-policy',
    '/terms-of-service'
  ]
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

  // XML转义函数 - 通用版本
  const escapeXml = (str) => {
    if (!str) return str
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\r/g, '&#13;')
      .replace(/\n/g, '&#10;')
      .replace(/\t/g, '&#9;')
  }

  // 添加静态路由
  staticRoutes.forEach(route => {
    const fullUrl = `${baseUrl}${route}`
    xml += `  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
  })

  try {
    // 使用与页面相同的Supabase连接方式
    const { createClient } = await import('@supabase/supabase-js')
    
    // 检查环境变量
    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
      console.error('Supabase config missing')
    } else {
      const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
      
      // 获取所有游戏（使用与useSupabase相同的查询）
      const { data: games, error: gamesError } = await supabase
        .from('appinfo')
        .select('app_name, category, created_at')
        .order('created_at', { ascending: false })
        .limit(1000) // 添加限制避免超时
      
      if (gamesError) {
        console.error('Supabase error:', gamesError.message)
      } else if (games && games.length > 0) {
        console.log(`Found ${games.length} games`)
        
        // 应用名称转换为 URL 友好的格式
        const appNameToSlug = (appName) => {
          return appName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        }
        
        const uniqueCategories = new Set()
        
        games.forEach(game => {
          if (game.app_name) {
            // 使用与实际路由相同的方式：直接使用app_name，进行URL编码
            const gameId = encodeURIComponent(game.app_name)
            const lastmod = game.created_at ? new Date(game.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            
            // 构建完整的URL - 先构建，再进行XML转义
            const gameUrl = `${baseUrl}/games/${gameId}`
            const detailUrl = `${baseUrl}/detail/${gameId}`
            
            // 添加游戏页面 - 对完整URL进行XML转义
            xml += `  <url>
    <loc>${escapeXml(gameUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
            
            // 添加详情页面 - 对完整URL进行XML转义
            xml += `  <url>
    <loc>${escapeXml(detailUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
            
            // 收集分类
            if (game.category) {
              uniqueCategories.add(game.category)
            }
          }
        })
        
        // 分类URL映射（从数据库值到URL slug，与category页面保持一致）
        const categoryUrlMap = {
          'shooting': 'shooting',
          'Sort': 'sort',
          'Boom Blast': 'boom-blast',
          'Merge': 'merge',
          'Find Difference': 'find-difference',
          'Match3': 'match3',
          'Parking': 'parking',
          'Tower Defense': 'tower-defense',
          'Music': 'music',
          'Puzzle': 'puzzle',
          'Ball': 'ball',
          'Running': 'running',
          'Connect': 'connect'
        }
        
        // 添加分类页面
        uniqueCategories.forEach(category => {
          const categoryUrl = categoryUrlMap[category] || category.toLowerCase().replace(/\s+/g, '-')
          const fullCategoryUrl = `${baseUrl}/category/${categoryUrl}`
          xml += `  <url>
    <loc>${escapeXml(fullCategoryUrl)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`
        })
        
        console.log(`Added ${uniqueCategories.size} categories`)
      } else {
        console.log('No games found in database')
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  xml += `</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})