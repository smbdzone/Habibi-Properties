'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { AdminProfile } from "../types/types";
import { getAbout } from "@/lib/actions";

const CreateAboutContext = createContext<AdminProfile | null | any>(null)

export const AboutProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<AdminProfile>()

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await getAbout()
                if (res.success) (
                    setData(res.data)
                )
            } catch (error) {
                console.log(`Error in fetching profile`)
            }
        };
        fetchAbout();
    }, [])
    return (
        <CreateAboutContext.Provider value={{ data }}>
            {children}
        </CreateAboutContext.Provider>
    )
}


export const useAbout = () => useContext(CreateAboutContext)