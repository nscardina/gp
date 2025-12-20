/**
 * Loads an image from a specified URL, as an ImageBitmap.
 * @param url url to load from.
 * @returns ImageBitmap.
 */
async function loadImage(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

export default loadImage