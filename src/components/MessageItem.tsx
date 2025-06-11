import type { Doc } from '@/convex/_generated/dataModel'

type Props = {
    message: Doc<'messages'>
    children: React.ReactNode
    isUser: boolean
}

export default function MessageItem({ message, children, isUser }: Props) {
    return (
        <>
            <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[95%] gap-4 md:max-w-[85%] ${isUser && 'flex-row-reverse'}`}>
                    <div className={`rounded-lg px-5 py-4 text-base ${isUser ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-gray-100 text-gray-900'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}
