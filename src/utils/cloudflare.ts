declare const __STATIC_CONTENT: KVNamespace, __STATIC_CONTENT_MANIFEST: string

export const getContentFromKVAsset = async (path: string): Promise<ArrayBuffer> => {
  let ASSET_MANIFEST: { [key: string]: string }
  if (typeof __STATIC_CONTENT_MANIFEST === 'string') {
    ASSET_MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST)
  } else {
    ASSET_MANIFEST = __STATIC_CONTENT_MANIFEST
  }

  const ASSET_NAMESPACE = __STATIC_CONTENT

  const key = ASSET_MANIFEST[path] || path
  if (!key) {
    return
  }

  let content = await ASSET_NAMESPACE.get(key, { type: 'arrayBuffer' })

  if (content) {
    content = content as ArrayBuffer
  }
  return content
}