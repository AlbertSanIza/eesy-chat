import { Moon, Sun, SunMoonIcon } from 'lucide-react'

import { useTheme, type Theme } from '@/components/theme/provider'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const cycleTheme = () => {
        let newTheme: Theme = 'light'
        switch (theme) {
            case 'light':
                newTheme = 'dark'
                break
            case 'dark':
                newTheme = 'system'
                break
        }
        setTheme(newTheme)
    }

    return (
        <div className="fixed top-3 right-3 z-10 rounded-lg border bg-sidebar p-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7" onClick={cycleTheme}>
                        <Sun className={cn('scale-0 rotate-90 transition-all', theme === 'light' && 'scale-100 rotate-0')} />
                        <Moon className={cn('absolute scale-0 rotate-90 transition-all', theme === 'dark' && 'scale-100 rotate-0')} />
                        <SunMoonIcon className={cn('absolute scale-0 rotate-90 transition-all', theme === 'system' && 'scale-100 rotate-0')} />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Theme</TooltipContent>
            </Tooltip>
        </div>
    )
}
