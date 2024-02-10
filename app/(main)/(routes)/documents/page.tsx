"use client";

import Image from 'next/image'
import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

const DocumentsPage = () => {
  const {user} = useUser()
  const create = useMutation(api.documents.create) 
  
  const onCreate=()=>{
    const promise = create({ title:"Untititled" });
    toast.promise(promise,{
      loading:"Creating note...",
      success:"Note created",
      error:"Failed to create note"
    })
  }
  return (
    <div className='h-full flex flex-col items-center justify-center space-y-4'>
      <Image src='/empty.png' width='300' height='300'
      alt='Empty'
      className='dark:hidden' />
      <Image src='/empty-dark.png' width='300' height='300'
      alt='Empty' className='hidden dark:block'/>
      <h2 className='text-lg font-medium'>
        Welcome to {user?.fullName}&apos;s sation
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className='h-4 w-4 mr-2'/>
        Create a note
      </Button>
      </div>
  )
}

export default DocumentsPage