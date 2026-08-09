/**
 * StoragePort — media + consent forms. Default backend is Supabase Storage (sits next to
 * the DB); switches to Cloudinary/UploadThing when images get heavy, or local in dev.
 * Consent enforcement (constraint #5) lives ABOVE this port, in the content domain: a
 * MediaAsset without consent cannot be attached to a public page regardless of backend.
 */
export interface StoredObject {
  key: string;
  url: string;
}

export interface StoragePort {
  put(key: string, data: Buffer, contentType: string): Promise<StoredObject>;
  url(key: string): string;
  remove(key: string): Promise<void>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
