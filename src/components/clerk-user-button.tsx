import { UserButton } from '@clerk/clerk-react'
import { BotMessageSquareIcon } from 'lucide-react'

import { ApiKeyInput } from '@/components/api-key-input'
import { useIsMobile } from '@/hooks/use-mobile'

export function ClerkUserButton() {
    const isMobile = useIsMobile()

    return (
        <div className="clerk-user-button z-60!">
            <UserButton
                showName
                appearance={{
                    elements: {
                        // Ensure the UserProfilePage modal appears above mobile sheets
                        modalContent: isMobile ? 'z-[1100] !important' : '',
                        modal: isMobile ? 'z-[1100] !important' : '',
                        userProfileModal: isMobile ? 'z-[1100] !important' : ''
                    }
                }}
            >
                <UserButton.UserProfilePage label="Settings" labelIcon={<BotMessageSquareIcon className="size-4" />} url="settings">
                    <div className="space-y-6">
                        <h1 className="-mt-[0px] border-b border-gray-200 pb-[15px] text-[17px] leading-6 font-bold text-inherit">Settings</h1>
                        <ApiKeyInput />
                    </div>
                </UserButton.UserProfilePage>
            </UserButton>
        </div>
    )
}
