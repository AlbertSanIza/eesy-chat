import { Moon, Sun, SunMoonIcon } from 'lucide-react'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
        } else if (theme === 'dark') {
            setTheme('system')
        } else {
            setTheme('light')
        }
    }

    return (
        <div className="fixed top-3 right-3 z-10 rounded-lg border bg-sidebar p-1">
            <Button variant="ghost" size="icon" className="size-7" onClick={cycleTheme}>
                <Sun className={cn('scale-0 rotate-90 transition-all', theme === 'light' && 'scale-100 rotate-0')} />
                <Moon className={cn('absolute scale-0 rotate-90 transition-all', theme === 'dark' && 'scale-100 rotate-0')} />
                <SunMoonIcon className={cn('absolute scale-0 rotate-90 transition-all', theme === 'system' && 'scale-100 rotate-0')} />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    )
}
