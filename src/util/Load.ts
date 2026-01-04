import type JSZip from "jszip";

/**
 * Loads an image from a specified URL, as an ImageBitmap.
 * @param url url to load from.
 * @returns ImageBitmap.
 */
export async function loadImage(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

export async function loadImageFromZip(zip: JSZip, path: string): Promise<ImageBitmap> {
  const file = zip.file(path)
  if (file === null) {
    throw new Error(`file "${path}" not found in zip`)
  }
  return createImageBitmap(await file.async("blob"))
}

export const loadText = async(url: string): Promise<string> => {
  return (await fetch(url)).text()
}