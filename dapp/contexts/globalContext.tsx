import React, { useState } from 'react'

interface IGlobalContextProps {
    user: any
    loading: boolean
    setUser: (user: any) => void
    setLoading: (loading: boolean) => void
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
    user: {},
    loading: true,
    setUser: () => {},
    setLoading: () => {},
})

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState({
        name: 'wxwxwx',
    })
    const [isLoading, setIsLoading] = useState(true)

    return (
        <GlobalContext.Provider
            value={{
                user: currentUser,
                loading: isLoading,
                setUser: setCurrentUser,
                setLoading: setIsLoading,
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}
