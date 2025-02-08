"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";
import { getDocument } from "@/lib/db/actions";
import { Document } from "@/lib/db/document-queries";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
};

export const Navbar = ({
  isCollapsed,
  onResetWidth
}: NavbarProps) => {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!params.documentId) return;

      try {
        const doc = await getDocument(params.documentId as string);
        if (doc) {
          const convertedDoc = {
            ...doc,
            _id: doc.id,
            _creationTime: new Date(doc.created_at).getTime(),
            id: doc.id,
            title: doc.title,
            userId: doc.userId,
            isArchived: doc.isArchived,
            content: doc.content,
            coverimage: doc.coverimage,
            icon: doc.icon,
            isPublished: doc.isPublished,
            created_at: doc.created_at,
            updated_at: doc.updated_at
          };
          setDocument(convertedDoc as Document);
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
      }
    };

    fetchDocument();
  }, [params.documentId]);

  if (document === null) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    )
  }

  if (document.isArchived) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full">
        <Banner documentId={document.id} />
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Publish initialData={document} />
            <Menu documentId={document.id} />
          </div>
        </div>
      </nav>
    </>
  );
};