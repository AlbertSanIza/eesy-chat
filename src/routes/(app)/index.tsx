import { createFileRoute } from '@tanstack/react-router'
import { CodeIcon, GraduationCapIcon, NewspaperIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAiChat } from '@/hooks/use-ai-chat'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(app)/')({
    component: RouteComponent
})

const suggestions = {
    default: ['How does AI work?', 'Are black holes real?', 'How many Rs are in the word "strawberry"?', 'What is the meaning of life?'],
    create: [
        'Write a short story about a robot discovering emotions',
        'Help me outline a sci-fi novel set in a post-apocalyptic world',
        'Create a character profile for a complex villain with sympathetic motives',
        'Give me 5 creative writing prompts for flash fiction'
    ],
    explore: [
        'Good books for fans of Rick Rubin',
        'Countries ranked by number of corgis',
        'Most successful companies in the world',
        'How much does Claude cost?'
    ],
    code: [
        'Write code to invert a binary search tree in Python',
        "What's the difference between Promise.all and Promise.allSettled?",
        "Explain React's useEffect cleanup function",
        'Best practices for error handling in async/await'
    ],
    learn: ["Beginner's guide to TypeScript", 'Explain the CAP theorem in distributed systems', 'Why is AI so expensive?', 'Are black holes real?']
}

function RouteComponent() {
    const { input, handleInputChange } = useAiChat({ id: 'home' })
    const [category, setCategory] = useState<'create' | 'explore' | 'code' | 'learn' | 'default'>('default')
    useDocumentTitle('eesy.chat')

    const handleCategorySelect = (option: 'create' | 'explore' | 'code' | 'learn') => {
        setCategory(category === option ? 'default' : option)
    }

    return (
        <div className="w-full pt-8 pb-38">
            <motion.div
                className="mx-auto flex size-full flex-col items-center justify-center gap-4 px-12"
                initial={{ opacity: input.length === 0 ? 1 : 0 }}
                animate={{ opacity: input.length === 0 ? 1 : 0 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
            >
                <div className="text-3xl font-semibold tracking-tight">How can I help you today?</div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => handleCategorySelect('create')}
                        className={cn('border hover:bg-[#F5DCEF] dark:hover:bg-[#2C2632]', category !== 'create' && 'border-transparent')}
                    >
                        <SparklesIcon />
                        Create
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleCategorySelect('explore')}
                        className={cn('border hover:bg-[#F5DCEF] dark:hover:bg-[#2C2632]', category !== 'explore' && 'border-transparent')}
                    >
                        <NewspaperIcon />
                        Explore
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleCategorySelect('code')}
                        className={cn('border hover:bg-[#F5DCEF] dark:hover:bg-[#2C2632]', category !== 'code' && 'border-transparent')}
                    >
                        <CodeIcon />
                        Code
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleCategorySelect('learn')}
                        className={cn('border hover:bg-[#F5DCEF] dark:hover:bg-[#2C2632]', category !== 'learn' && 'border-transparent')}
                    >
                        <GraduationCapIcon />
                        Learn
                    </Button>
                </div>
                <div className="flex flex-col">
                    {suggestions[category].map((suggestion) => (
                        <Button
                            variant="ghost"
                            className="hover:bg-[#F5DCEF] dark:hover:bg-[#2C2632]"
                            key={suggestion}
                            onClick={() => handleInputChange({ id: 'home', value: `${suggestion} ` })}
                        >
                            {suggestion}
                        </Button>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
