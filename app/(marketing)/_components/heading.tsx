"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {useConvexAuth} from 'convex/react'
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";

export const Heading = () => {
  const {isAuthenticated, isLoading} = useConvexAuth()
  return(
  <div className="max-w-3xl space-y-4">
    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
      Your ideas, Documents, & Plans, Unifield. Welcome to   
      <span> </span>
      <span className="underline">Sation.</span>
    </h1>
    <h3 className="text-base sm:text-xl md:text-2xl font-medium">
      sation is connected workplace where better, faster decisions happen.
    </h3>
    {isLoading && (
      <div className="w-full flex items-ceter justify-center">
      <Spinner size='lg'/>
      </div>
    )}
    {isAuthenticated && !isLoading && (
    <Button >
      <Link href='/documents'>
      Get Started
      </Link>
      <ArrowRight className="h-4 w-4 ml-2"/>
    </Button>
    )}
     {!isAuthenticated && !isLoading && (
      <SignInButton mode='modal'>
        <Button>
          Get sation free
          <ArrowRight className="h-4 w-4 ml-2"/>
    </Button>
    </SignInButton>
    
    )}
    
  </div>
  )
}