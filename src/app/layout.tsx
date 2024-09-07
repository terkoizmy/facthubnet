"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider, useAuth } from "@clerk/clerk-react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "react-hot-toast";


const inter = Inter({ subsets: ["latin"] })

// tolong di ubah pake .env stringya
const convex = new ConvexReactClient(`${process.env.NEXT_PUBLIC_CONVEX_URL}`)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // tolong di ubah pake .env stringya
    <ClerkProvider
      publishableKey={`${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}`}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <html lang="en">
          <body className={inter.className}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster position="top-right" />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
