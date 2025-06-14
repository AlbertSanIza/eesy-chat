import { CheckIcon, CopyIcon } from 'lucide-react'
import { marked } from 'marked'
import type { JSX, ReactNode } from 'react'
import { memo, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ShikiHighlighter, { isInlineCode, type Element } from 'react-shiki'
import remarkGfm from 'remark-gfm'

import { Button } from '@/components/ui/button'

interface CodeHighlightProps {
    className?: string | undefined
    children?: ReactNode | undefined
    node?: Element | undefined
}

export const CodeHighlight = ({ className, children, node, ...props }: CodeHighlightProps): JSX.Element => {
    const [copied, setCopied] = useState(false)
    const match = className?.match(/language-(\w+)/)
    const language = match ? match[1] : undefined
    const isInline: boolean | undefined = node ? isInlineCode(node) : undefined

    return !isInline ? (
        <div className="mb-4 overflow-hidden rounded-lg border bg-sidebar dark:bg-[#372D3D] [&_.shiki]:bg-transparent! [&>pre>pre]:rounded-t-lg!">
            <div className="flex items-center justify-between p-1 pl-4 text-sm">
                {language}
                <Button
                    className="text-xs"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        navigator.clipboard.writeText(children as string)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1000)
                    }}
                >
                    <CheckIcon className={`transition-opacity ${copied ? 'opacity-100' : 'opacity-0'}`} />
                    <CopyIcon className={`absolute transition-opacity ${copied ? 'opacity-0' : 'rotate-0 opacity-100'}`} />
                </Button>
            </div>
            <ShikiHighlighter
                defaultColor="light-dark()"
                language={language}
                showLanguage={false}
                theme={{ light: 'github-light', dark: 'github-dark' }}
                addDefaultStyles={false}
                showLineNumbers
                className="overflow-auto rounded-none border-t bg-[#F5ECF9] p-2 text-sm dark:bg-[#1B161F]"
                {...props}
            >
                {String(children)}
            </ShikiHighlighter>
        </div>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    )
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown)
    return tokens.map((token) => token.raw)
}

const MemoizedMarkdownBlock = memo(
    ({ content }: { content: string }) => {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: CodeHighlight,
                    table: ({ children }) => (
                        <div className="overflow-hidden rounded-lg border">
                            <table>{children}</table>
                        </div>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        )
    },
    (prevProps, nextProps) => {
        if (prevProps.content !== nextProps.content) {
            return false
        }
        return true
    }
)
MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock'

export const MemoizedMarkdown = memo(({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])

    return blocks.map((block, index) => <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />)
})
MemoizedMarkdown.displayName = 'MemoizedMarkdown'
