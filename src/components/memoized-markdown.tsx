import { CheckIcon, CopyIcon } from 'lucide-react'
import { marked } from 'marked'
import type { JSX, ReactNode } from 'react'
import { memo, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { isInlineCode, type Element } from 'react-shiki'
import remarkGfm from 'remark-gfm'

import { ShorthandCodeHighlighter } from '@/components/shorthand-code-highlighter'
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
            <div className="flex items-center p-1 pl-4 text-sm">
                {language}
                <Button
                    className="ml-auto self-end"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        navigator.clipboard.writeText((children as string).trim())
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1000)
                    }}
                >
                    <CheckIcon className={`transition-opacity ${copied ? 'opacity-100' : 'opacity-0'}`} />
                    <CopyIcon className={`absolute transition-opacity ${copied ? 'opacity-0' : 'rotate-0 opacity-100'}`} />
                </Button>
            </div>
            <ShorthandCodeHighlighter
                language={language}
                code={String(children).trim()}
                className="overflow-auto rounded-none border-t bg-[#F5ECF9] p-2 text-sm dark:bg-[#1B161F]"
            />
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
                        <div className="mb-4 overflow-hidden rounded-lg border">
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
