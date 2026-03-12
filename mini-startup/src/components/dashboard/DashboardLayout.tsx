import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import loadingAnimation from '@/animation-loading/loading.json'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import SidebarContent from './SidebarContent'
import { ChevronRight } from 'lucide-react'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLightTheme, setIsLightTheme] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  
  // Отслеживаем изменения темы
  useEffect(() => {
    const checkTheme = () => {
      setIsLightTheme(document.documentElement.classList.contains('light'))
    }
    
    checkTheme()
    
    // Создаем MutationObserver для отслеживания изменений класса
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let finished = false
    const finishLoading = () => {
      if (finished) return
      finished = true
      window.setTimeout(() => setShowLoading(false), 600)
    }
    if (document.readyState === 'complete') {
      finishLoading()
    } else {
      window.addEventListener('load', finishLoading)
    }
    const fallback = window.setTimeout(finishLoading, 2000)
    return () => {
      window.removeEventListener('load', finishLoading)
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 font-sans flex overflow-hidden">
      {showLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0b0b0b]">
          <div className="relative flex items-center justify-center">
            <Lottie animationData={loadingAnimation} loop className="w-64 h-64 sm:w-72 sm:h-72" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0b0b0b]" />
          </div>
        </div>
      )}
      {/* Кнопка на всю высоту для открытия меню когда оно скрыто - без границ */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-12 items-center justify-center bg-transparent hover:bg-sidebar/10 transition-all group"
          aria-label="Открыть меню"
        >
          <ChevronRight className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )}

      {/* Sidebar - Desktop */}
      <div className={`hidden lg:flex h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'
      }`}>
        <aside className={`flex flex-col border-r border-sidebar-border/50 bg-sidebar backdrop-blur-xl text-sidebar-foreground shadow-xl h-screen w-64 relative flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'opacity-0' : 'opacity-100'
        }`}>
          <SidebarContent onCollapse={() => setSidebarCollapsed(true)} />
        </aside>
      </div>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-12' : ''
      } ${isLightTheme ? 'bg-[hsl(0,0%,98%)]' : 'bg-background'}`}>
        <Header sidebarContent={<SidebarContent />} />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-full mx-auto space-y-8 pb-20">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

