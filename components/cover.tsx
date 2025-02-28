"use client";

import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCoverImage } from "@/hooks/use-cover-image";
import { updateDocument, getDocument } from "@/lib/db/actions";
import { useEdgeStore } from "@/lib/edgestore";

interface CoverImageProps {
  url?: string;
  preview?: boolean;
}

export const Cover = ({
  url: initialUrl,
  preview,
}: CoverImageProps) => {
  const { edgestore } = useEdgeStore();
  const params = useParams();
  const coverImage = useCoverImage();
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    const handleRefresh = async () => {
      if (!preview && params.documentId) {
        const doc = await getDocument(params.documentId as string);
        if (doc) {
          setUrl(doc.coverimage);
        }
      }
    };

    window.addEventListener('refresh-document', handleRefresh);
    return () => {
      window.removeEventListener('refresh-document', handleRefresh);
    };
  }, [params.documentId, preview]);

  const onRemove = async () => {
    if (url) {
      await edgestore.publicFiles.delete({
        url: url
      })
    }
    await updateDocument(params.documentId as string, {
      coverimage: undefined
    });

    // Update UI immediately
    setUrl(undefined);
    window.dispatchEvent(new Event('refresh-document'));
  };

  return (
    <div className={cn(
      "relative w-full h-[35vh] group",
      !url && "h-[12vh]",
      url && "bg-muted"
    )}>
      {!!url && (
        <Image
          src={url}
          fill
          alt="Cover"
          className="object-cover"
        />
      )}
      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

Cover.Skeleton = function CoverSkeleton() {
  return (
    <Skeleton className="w-full h-[12vh]" />
  )
}