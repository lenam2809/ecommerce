import { User2, LogOut, Package } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { User } from "@/services/auth-service"

interface UserMenuProps {
    user: User | null
    isAuthenticated: boolean
    logout: () => void
    getUserInitials: () => string
}

export function UserMenu({ user, isAuthenticated, logout, getUserInitials }: UserMenuProps) {
    return isAuthenticated ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group relative rounded-full h-9 w-9 p-0 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-full w-full border border-black/10 dark:border-white/10 group-hover:border-primary/50 transition-colors shadow-sm">
                        <AvatarImage src={user?.avatar} alt={user?.email} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-72 bg-popover border-line backdrop-blur-xl shadow-2xl rounded-2xl p-2 z-50"
            >
                <div className="flex items-center justify-start gap-4 p-3 mb-2 rounded-xl bg-surface">
                    <Avatar className="h-10 w-10 border border-line">
                        <AvatarImage src={user?.avatar} alt={user?.email} />
                        <AvatarFallback className="bg-brand-soft text-brand font-semibold">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-small truncate text-ink">{user?.firstName} {user?.lastName}</span>
                        <span className="text-tiny text-ink-faint truncate">{user?.email}</span>
                    </div>
                </div>

                <div className="px-1 py-1">
                    <DropdownMenuItem asChild className="focus:bg-surface focus:text-ink cursor-pointer rounded-lg my-0.5 transition-colors">
                        <Link href="/account" className="flex items-center py-2 relative">
                            <User2 className="mr-3 h-4 w-4 text-ink-soft" />
                            <span className="font-medium">Tài khoản của tôi</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-surface focus:text-ink cursor-pointer rounded-lg my-0.5 transition-colors">
                        <Link href="/account/orders" className="flex items-center py-2 relative">
                            <Package className="mr-3 h-4 w-4 text-ink-soft" />
                            <span className="font-medium">Đơn hàng của tôi</span>
                        </Link>
                    </DropdownMenuItem>
                </div>

                <div className="h-px bg-line my-1 mx-1" />

                <div className="px-1 pb-1">
                    <DropdownMenuItem
                        onClick={() => logout()}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg my-0.5 transition-colors"
                    >
                        <div className="flex items-center py-2 w-full">
                            <LogOut className="mr-3 h-4 w-4" />
                            <span className="font-medium">Đăng xuất</span>
                        </div>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 transition-colors border border-transparent">
                    <User2 className="h-5 w-5 text-ink-soft" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 bg-popover border-line backdrop-blur-xl shadow-2xl rounded-2xl p-2 z-50"
            >
                <div className="px-1 py-1 space-y-1">
                    <DropdownMenuItem asChild className="focus:bg-surface focus:text-ink cursor-pointer rounded-lg transition-colors">
                        <Link href="/login" className="flex items-center py-2">
                            <User2 className="mr-3 h-4 w-4 text-ink-soft" />
                            <span className="font-medium">Đăng nhập</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-surface focus:text-ink cursor-pointer rounded-lg transition-colors">
                        <Link href="/register" className="flex items-center py-2">
                            <span className="font-medium ml-7">Đăng ký</span>
                        </Link>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}