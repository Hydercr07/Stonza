"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// Lets any number of AdminMediaUploader instances inside the same form
// report "I'm mid-upload right now" up to that form's submit button, via a
// shared Set of busy uploader ids (so independent uploaders never clobber
// each other's status). The default value below is a working no-op --
// reading/writing it outside a UploadStatusProvider is a silent no-op
// rather than a crash, so this stays backward-compatible with any form that
// doesn't wrap itself in the provider.
interface UploadStatusContextValue {
  uploading: boolean;
  setUploading: (id: string, isUploading: boolean) => void;
}

const UploadStatusContext = createContext<UploadStatusContextValue>({
  uploading: false,
  setUploading: () => {},
});

export function UploadStatusProvider({ children }: { children: React.ReactNode }) {
  const busyIds = useRef(new Set<string>());
  const [uploading, setUploadingState] = useState(false);

  const setUploading = useCallback((id: string, isUploading: boolean) => {
    if (isUploading) {
      busyIds.current.add(id);
    } else {
      busyIds.current.delete(id);
    }
    setUploadingState(busyIds.current.size > 0);
  }, []);

  const value = useMemo(() => ({ uploading, setUploading }), [uploading, setUploading]);

  return <UploadStatusContext.Provider value={value}>{children}</UploadStatusContext.Provider>;
}

export function useUploadStatus() {
  return useContext(UploadStatusContext);
}
