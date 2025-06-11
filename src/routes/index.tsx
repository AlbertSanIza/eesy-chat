import { useChat } from '@ai-sdk/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { CodeIcon, GraduationCapIcon, NewspaperIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ChangeEvent } from 'react'

import Input from '@/components/input'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
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
    const navigate = useNavigate({ from: '/' })
    const createThread = useMutation(api.threads.create)
    const { input, status, handleInputChange } = useChat()
    const [category, setCategory] = useState<'create' | 'explore' | 'code' | 'learn' | 'default'>('default')

    const handleCategorySelect = (option: 'create' | 'explore' | 'code' | 'learn') => {
        setCategory(category === option ? 'default' : option)
    }

    const handleOnSubmit = async () => {
        navigate({ to: `/${await createThread({ prompt: input.trim() })}` })
    }

    return (
        <div className="w-full pt-8 pb-38">
            <motion.div
                className="mx-auto flex size-full flex-col items-center justify-center gap-4 px-12"
                animate={{ opacity: input.length === 0 ? 1 : 0 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
            >
                <div className="text-2xl font-semibold tracking-tight">How can I help you today?</div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        className={cn('border', category !== 'create' && 'border-transparent')}
                        onClick={() => handleCategorySelect('create')}
                    >
                        <SparklesIcon />
                        Create
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn('border', category !== 'explore' && 'border-transparent')}
                        onClick={() => handleCategorySelect('explore')}
                    >
                        <NewspaperIcon />
                        Explore
                    </Button>
                    <Button variant="ghost" className={cn('border', category !== 'code' && 'border-transparent')} onClick={() => handleCategorySelect('code')}>
                        <CodeIcon />
                        Code
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn('border', category !== 'learn' && 'border-transparent')}
                        onClick={() => handleCategorySelect('learn')}
                    >
                        <GraduationCapIcon />
                        Learn
                    </Button>
                </div>
                <div className="flex flex-col">
                    {suggestions[category].map((suggestion) => (
                        <Button
                            variant="ghost"
                            key={suggestion}
                            onClick={() => handleInputChange({ target: { value: `${suggestion} ` } } as ChangeEvent<HTMLInputElement>)}
                        >
                            {suggestion}
                        </Button>
                    ))}
                </div>
            </motion.div>
            <Input input={input} status={status} onInputChange={handleInputChange} onSubmit={handleOnSubmit} />
        </div>
    )
}
