"use client"
import Link from "next/link"
import { usePathname } from "next/navigation";


const links = [
    { href: "/docs", label: "Docs" },
    { href: "/explorer", label: "Explorer" },

];
export default function Navbar() {
    const pathname = usePathname()
    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
            <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
                <Link
                    href={`/`}
                    className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight active"
                >
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">₮</span>
                    <span>testpay
                        <span className="text-primary animate-blink">_</span>
                    </span>
                </Link>

                <div className="items-center gap-5 md:flex">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={isActive ? "text-sm text-white transition-colors hover:text-foreground" : "text-sm text-muted-foreground transition-colors hover:text-foreground"}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </div>


                <div className="ml-auto flex items-center gap-2">
                    <Link
                        href={``}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-[600] cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
                    >
                        Sign in
                    </Link>
                    <Link
                        href={``}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-[600] cursor-pointer transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs"
                    >
                        Get test money
                    </Link>
                </div>
            </nav >
        </header>
    )
}
