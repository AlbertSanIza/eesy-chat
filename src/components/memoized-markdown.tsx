import { Button } from '@/components/ui/button'
import { marked } from 'marked'
import { type ClassAttributes, type HTMLAttributes, memo, useMemo } from 'react'
import ReactMarkdown, { type ExtraProps } from 'react-markdown'
import ShikiHighlighter, { isInlineCode } from 'react-shiki'
import remarkGfm from 'remark-gfm'

const CodeHighlight = ({ className, children, node, ...props }: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps) => {
    const code = String(children).trim()
    const match = className?.match(/language-(\w+)/)
    const language = match ? match[1] : undefined
    const isInline = node ? isInlineCode(node) : undefined

    return !isInline ? (
        <div className="relative">
            <Button className="absolute top-4 right-0 z-10 text-xs" size="sm" variant="link" onClick={() => navigator.clipboard.writeText(code)}>
                copy
            </Button>
            <ShikiHighlighter defaultColor="light-dark()" language={language} theme={{ light: 'github-light', dark: 'github-dark' }} {...props} showLineNumbers>
                {code}
            </ShikiHighlighter>
        </div>
    ) : (
        <code className={className} {...props}>
            {code}
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
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeHighlight }}>
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
