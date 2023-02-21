import { useState } from 'react'
import clsx from 'clsx'

export function GlobalMenu() {
    const [index, setIndex] = useState(0)

    return (
        <div className="w-[300px] bg-zinc-800 p-4">
            <div className="flex rounded-md bg-zinc-900 p-1 text-center text-sm font-bold">
                <Button text={'Betslip'} isActive={index === 0} click={() => setIndex(0)} />
                <Button text={'My bets'} isActive={index === 1} click={() => setIndex(1)} />
            </div>
            <div className="text-center">
                {index === 0 ? (
                    <>
                        <h3 className="font-bold">Betslip is empty</h3>
                        <p className="text-sm text-zinc-600">
                            To add a bet to your betslip, choose a market and make your selection
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="font-bold">No active bets</h3>
                        <p className="text-sm text-zinc-600">
                            All unsettled bets will be listed here
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}

function Button({
    text,
    isActive,
    click,
}: {
    text: string
    isActive: boolean
    click: () => false | void
}) {
    return (
        <div
            onClick={click}
            className={clsx('w-1/2 p-1 hover:cursor-pointer', {
                'bg-zinc-800': isActive,
                'text-zinc-600': !isActive,
            })}
        >
            {text}
        </div>
    )
}
