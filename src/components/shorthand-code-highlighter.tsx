import { highlightCode } from '@/lib/shiki'
import { memo, useEffect, useState } from 'react'

export const ShorthandCodeHighlighter = memo(({ code, language = 'text', className = '' }: { code: string; language?: string; className?: string }) => {
    const [highlightedHtml, setHighlightedHtml] = useState<string>('')

    useEffect(() => {
        const highlight = async () => {
            try {
                const html = await highlightCode(code, language)
                setHighlightedHtml(html)
            } catch {
                setHighlightedHtml(`<pre><code>${code}</code></pre>`)
            }
        }
        highlight()
    }, [code, language])

    return <div className={className} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
})

ShorthandCodeHighlighter.displayName = 'ShorthandCodeHighlighter'
