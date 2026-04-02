import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  // 在 composable 内部获取配置
  const config = useRuntimeConfig()
  
  // 检查环境变量是否存在
  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured')
    return {
      supabase: null,
      getGameByName: async () => null,
      searchGames: async () => [],
      getAllGames: async () => [],
      getGamesByTypeAndCategory: async () => [],
      getGamesByTypeAndCategoryWithOffset: async () => [],
      getH5GamesByCategory: async () => [],
      appNameToSlug: (appName) => appName,
      slugToAppName: (slug) => slug
    }
  }
  
  // 初始化 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 根据应用标识获取游戏数据（优先 package_name，其次 app_name）
  const getGameByName = async (appName) => {
    try {
      const identifier = String(appName || '').trim()
      if (!identifier) return null

      // 1) 优先按 package_name 精确匹配（可同时拿到 app_type）
      const byPackage = await supabase
        .from('appinfo')
        .select('*')
        .eq('package_name', identifier)
        .limit(1)

      if (byPackage.error) {
        throw byPackage.error
      }

      if (byPackage.data?.[0]) {
        return byPackage.data[0]
      }

      // 2) package_name 未命中时，再按 app_name 精确匹配
      const byName = await supabase
        .from('appinfo')
        .select('*')
        .eq('app_name', identifier)
        .limit(1)

      if (byName.error) {
        throw byName.error
      }

      return byName.data?.[0] || null
    } catch (error) {
      throw error
    }
  }

  // 将应用名称转换为 URL 友好的格式
  const appNameToSlug = (appName) => {
    const slug = appName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 将空格替换为连字符
      .replace(/-+/g, '-') // 合并多个连字符
      .trim()
    
    return slug
  }

  // 将 URL slug 转换回应用名称
  const slugToAppName = (slug) => {
    const appName = slug
      .replace(/-/g, ' ') // 将连字符替换为空格
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // 首字母大写
      .join(' ')
    
    return appName
  }

  // 搜索游戏功能
  const searchGames = async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from('appinfo')
        .select('id, app_name, category, developer, icon_url')
        .or(`app_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,developer.ilike.%${searchTerm}%`)
        .limit(20)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      return []
    }
  }

  // 获取所有游戏列表
  const getAllGames = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('appinfo')
        .select('id, app_name, category, developer, icon_url, rating, installs')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      return []
    }
  }

  // 根据应用类型和分类获取游戏
  const getGamesByTypeAndCategory = async (appType = 'h5', category = null, limit = 21) => {
    try {
      let query = supabase
        .from('appinfo')
        .select('app_name, icon_url, category, app_type')
        .eq('app_type', appType)
        .order('created_at', { ascending: false })
        .limit(limit)

      // 如果指定了分类，添加分类筛选
      if (category) {
        query = query.ilike('category', `%${category}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      return []
    }
  }

  // 根据应用类型和分类获取游戏（支持分页）
  const getGamesByTypeAndCategoryWithOffset = async (appType = 'h5', category = null, limit = 21, offset = 0) => {
    try {
      let query = supabase
        .from('appinfo')
        .select('app_name, icon_url, category, app_type')
        .eq('app_type', appType)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // 如果指定了分类，使用精确匹配 eq
      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      return []
    }
  }

  // 根据分类获取 H5 游戏 (保持向后兼容)
  const getH5GamesByCategory = async (category = null, limit = 21) => {
    return getGamesByTypeAndCategory('h5', category, limit)
  }

  return {
    supabase,
    getGameByName,
    searchGames,
    getAllGames,
    getGamesByTypeAndCategory,
    getGamesByTypeAndCategoryWithOffset,
    getH5GamesByCategory,
    appNameToSlug,
    slugToAppName
  }
} 