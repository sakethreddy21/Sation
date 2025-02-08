"use client";

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/spinner'
import { Search, Trash, Undo } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/modals/confirm-modal'
import { getTrashDocuments, restoreDocument, deleteDocument } from '@/lib/db/actions'
import { Document } from '@/lib/db/document-queries'

export const TrashBox = () => {
  const router = useRouter()
  const params = useParams()
  const [search, setSearch] = useState('')
  const [documents, setDocuments] = useState<Document[] | undefined>(undefined)

  const fetchDocuments = async () => {
    try {
      const docs = await getTrashDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to fetch trash documents:', error)
    }
  }

  useEffect(() => {
    const handleRefresh = () => {
      fetchDocuments();
    };

    window.addEventListener('refresh-trash-box', handleRefresh);
    fetchDocuments();

    return () => {
      window.removeEventListener('refresh-trash-box', handleRefresh);
    };
  }, []);

  const filterDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase())
  });

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  }

  const onRestore = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: string,
  ) => {
    event.stopPropagation();
    const promise = restoreDocument(documentId)
      .then(() => {
        // Refresh both trash box and document list
        window.dispatchEvent(new Event('refresh-trash-box'));
        window.dispatchEvent(new Event('refresh-document-list'));
      });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored!",
      error: "Failed to restore note."
    });
  };

  const onRemove = async (documentId: string) => {
    const promise = deleteDocument(documentId)
      .then(() => {
        // Refresh trash box after deletion
        window.dispatchEvent(new Event('refresh-trash-box'));
      });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted",
      error: "Failed to delete note"
    });

    if (params.documentId === documentId) {
      router.push('/documents');
    }
  }

  if (documents === undefined) {
    return (
      <div className='h-full flex items-center justify-center p-4'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='text-sm'>
      <div className='flex items-center gap-x-1 p-2'>
        <Search className='h-4 w-4 text-muted-foreground' />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='h-7 px-2 focus-visible:ring-transparent bg-secondary'
          placeholder='Filter by page title...' />
      </div>
      <div className='mt-2 px-1 pb-1'>
        {!filterDocuments?.length ? (
          <p className='text-xs text-center text-muted-foreground pb-2'>
            No documents in the trash
          </p>
        ) : (
          filterDocuments?.map((document) => (
            <div
              key={document.id}
              role='button'
              onClick={() => onClick(document.id)}
              className='text-sm rounded-sm w-full hover:bg-primary/5 flex items-center justify-between text-primary p-2'>
              <span className="truncate">{document.title}</span>
              <div className='flex items-center'>
                <div
                  onClick={(e) => onRestore(e, document.id)}
                  role='button'
                  className='rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600'>
                  <Undo className='h-4 w-4 text-muted-foreground' />
                </div>
                <ConfirmModal onConfirm={() => onRemove(document.id)}>
                  <div
                    role='button'
                    className='rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600'>
                    <Trash className='h-4 w-4 text-muted-foreground' />
                  </div>
                </ConfirmModal>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

