"use client";

import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import { getDocument, updateDocument } from "@/lib/db/actions";
import { Document } from "@/lib/db/document-queries";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentIdPageProps {
  params: {
    documentId: string;
  };
};

const DocumentIdPage = ({
  params
}: DocumentIdPageProps) => {
  const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);
  const [document, setDocument] = useState<Document | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await getDocument(params.documentId);
        if (doc) {
          // Convert PostgreSQL document to match Convex structure
          const convertedDoc = {
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime(),
          };
          setDocument(convertedDoc);
        } else {
          setDocument(null);
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
        setDocument(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [params.documentId]);

  const onChange = async (content: string) => {
    if (!document) return;

    try {
      const updated = await updateDocument(params.documentId, {
        content
      });
      if (updated) {
        // Convert the updated document
        const convertedDoc = {
          ...updated,
          _id: updated.id,
          _creationTime: new Date(updated.created_at).getTime(),
        };
        setDocument(convertedDoc);
      }
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return <div>Not found</div>
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverimage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor
          onChange={onChange}
          initialContent={document.content}
        />
      </div>
    </div>
  );
}

export default DocumentIdPage;