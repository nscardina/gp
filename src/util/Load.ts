import type JSZip from "jszip";

/**
 * Loads an image from a specified URL, as an ImageBitmap.
 * @param url url to load from.
 * @returns ImageBitmap.
 */
export async function loadImage(url: string): Promise<ImageBitmap> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}${url}`);
    const blob = await response.blob();
    return createImageBitmap(blob);
  } catch (exception) {
    console.error(exception)
    throw exception
  }
  
}

export async function loadImageFromZip(zip: JSZip, path: string): Promise<ImageBitmap> {
  try {
    const file = zip.file(path)
    if (file === null) {
      throw new Error(`file "${path}" not found in zip`)
    }
    return createImageBitmap(await file.async("blob"))
  } 
  catch (exception) {
    console.error(exception)
    throw exception
  }
  
}

export const loadText = async(url: string): Promise<string> => {
  try {
    return (await fetch(`${import.meta.env.BASE_URL}${url}`)).text()
  } catch (exception) {
    console.error(exception)
    throw exception
  }
}