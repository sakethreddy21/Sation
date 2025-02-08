"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { getDocument, updateDocument } from "@/lib/db/actions";
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
  const [document, setDocument] = useState<any>(undefined);

  useEffect(() => {
    const fetchDocument = async () => {
      const doc = await getDocument(params.documentId);
      if (doc) {
        setDocument({
          ...doc,
          _id: doc.id,
          _creationTime: new Date(doc.created_at).getTime()
        });
      } else {
        setDocument(null);
      }
    };
    fetchDocument();
  }, [params.documentId]);

  const onChange = async (content: string) => {
    await updateDocument(params.documentId, {
      content
    });
  };

  if (document === undefined) {
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

  if (document === null) {
    return <div>Not found</div>
  }

  return (
    <div className="pb-40">
      <Cover preview url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar preview initialData={document} />
        <Editor
          editable={false}
          onChange={onChange}
          initialContent={document.content}
        />
      </div>
    </div>
  );
}

export default DocumentIdPage;