'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment, useSelectedLayoutSegments } from 'next/navigation'
import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import { Logo } from './icons/Logo'
import { Game } from './icons/Game'
import { Football } from './icons/Football'

const items = [
    {
        icon: <Logo />,
        name: 'Home',
        slug: '',
    },
    {
        icon: <Football />,
        name: 'Sport',
        slug: 'sport',
        subitems: [
            {
                icon: <Football />,
                name: 'Football',
                slug: 'football',
            },
            {
                icon: <Game />,
                name: 'Basketball',
                slug: 'basketball',
            },
        ],
    },
    {
        icon: <Game />,
        name: 'Esport',
        slug: 'esport',
        subitems: [
            {
                icon: <Football />,
                name: 'Dota2',
                slug: 'dota2',
            },
            {
                icon: <Game />,
                name: 'LOL',
                slug: 'lol',
            },
        ],
    },
]

export function GlobalNav() {
    const [isOpen, setIsOpen] = useState(false)
    const close = () => setIsOpen(false)

    const segment = useSelectedLayoutSegment()

    const subitems = items.find((item) => item.slug === segment)?.subitems

    return (
        <div className="flex w-full flex-col border-b border-gray-800 bg-black lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-gray-800">
            <div className="flex h-14 items-center border-b border-gray-800 py-4 px-4 lg:h-auto ">
                <Link href="/" className="group flex w-full items-center gap-x-2.5" onClick={close}>
                    <div className="h-7 w-7 fill-white">
                        <Logo />
                    </div>
                    <h3 className="font-semibold tracking-wide text-white">Bet Dog</h3>
                </Link>
            </div>
            <button
                type="button"
                className="group absolute right-0 top-0 flex h-14 items-center gap-x-2 px-4 lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="font-medium text-gray-100 group-hover:text-gray-400">Menu</div>
                {/* {isOpen ? (
                    <XIcon className="block w-6 text-gray-400" />
                ) : (
                    <MenuAlt2Icon className="block w-6 text-gray-400" />
                )} */}
            </button>

            <div
                className={clsx('overflow-y-auto lg:static lg:block', {
                    'fixed inset-x-0 bottom-0 top-14 mt-px bg-black': isOpen,
                    hidden: !isOpen,
                })}
            >
                <nav className="flex px-2 py-5">
                    <div>
                        {items.map((item) => (
                            <GlobalNavItem
                                key={item.slug}
                                icon={item.icon}
                                name={item.name}
                                slug={item.slug}
                                close={close}
                            />
                        ))}
                    </div>
                    {segment !== 'home' && (
                        <div>
                            {subitems?.map((item) => (
                                <GlobalNavSubItem
                                    key={item.slug}
                                    icon={item.icon}
                                    name={item.name}
                                    slug={item.slug}
                                />
                            ))}
                        </div>
                    )}
                </nav>
            </div>
        </div>
    )
}

function GlobalNavItem({
    icon,
    name,
    slug,
    close,
}: {
    icon: ReactNode
    name: string
    slug: string
    close: () => false | void
}) {
    const segment = useSelectedLayoutSegment()
    const isActive = slug === segment

    return (
        <>
            <Link
                onClick={close}
                href={`/${slug}`}
                className={clsx(
                    'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:text-white',
                    {
                        'text-gray-400 hover:bg-gray-800': !isActive,
                        'text-white': isActive,
                    },
                )}
            >
                <div
                    className={clsx('h-7 w-7', {
                        'fill-gray-400 group-hover:fill-white': !isActive,
                        'fill-white': isActive,
                    })}
                >
                    {icon}
                </div>
                {segment === null && <span>{name}</span>}
            </Link>
        </>
    )
}

function GlobalNavSubItem({ icon, name, slug }: { icon: ReactNode; name: string; slug: string }) {
    const segments = useSelectedLayoutSegments()
    const isActive = slug === segments[1]

    return (
        <>
            <Link
                href={`/${segments[0]}/${slug}`}
                className={clsx(
                    'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:text-white',
                    {
                        'text-gray-400 hover:bg-gray-800': !isActive,
                        'text-white': isActive,
                    },
                )}
            >
                <div
                    className={clsx('h-7 w-7', {
                        'fill-gray-400 group-hover:fill-white': !isActive,
                        'fill-white': isActive,
                    })}
                >
                    {icon}
                </div>
                <span>{name}</span>
            </Link>
        </>
    )
}
