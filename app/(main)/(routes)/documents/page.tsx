"use client";

import Image from "next/image";
import { useSession } from "@/lib/providers/session-provider";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createDocument } from "@/lib/db/actions";

const DocumentsPage = () => {
  const router = useRouter();
  const { user, isLoading } = useSession();

  const onCreate = async () => {
    if (!user?.id) return;

    const promise = createDocument({
      title: "Untitled",
      userId: user.id,
      isPublished: false,
      isArchived: false,
    })
      .then((document) => router.push(`/documents/${document.id}`))
      .catch((error) => {
        console.error('Failed to create document:', error);
        throw error;
      });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note."
    });
  };

  return ( 
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        height="300"
        width="300"
        alt="Empty"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        height="300"
        width="300"
        alt="Empty"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.name}&apos;s Sation
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
   );
}
 
export default DocumentsPage;