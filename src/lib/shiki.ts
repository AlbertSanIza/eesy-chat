import { bundledLanguages } from 'shiki'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const highlighterPromise = createHighlighterCore({
    themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
    langs: [import('@shikijs/langs/bash'), import('@shikijs/langs/typescript'), import('@shikijs/langs/javascript')],
    engine: createJavaScriptRegexEngine()
})

export async function highlightCode(code: string, lang: string) {
    const highlighter = await highlighterPromise
    const loadedLanguages = highlighter.getLoadedLanguages()
    if (!loadedLanguages.includes(lang) && lang in bundledLanguages) {
        try {
            await highlighter.loadLanguage(bundledLanguages[lang as keyof typeof bundledLanguages])
        } catch (error) {
            console.warn(`Failed to load language "${lang}":`, error)
        }
    }
    const finalLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text'
    if (finalLang === 'text' && lang !== 'text') {
        console.warn(`Language "${lang}" not supported, using plain text`)
    }
    return highlighter.codeToHtml(code, {
        lang: finalLang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: 'light-dark()'
    })
}
