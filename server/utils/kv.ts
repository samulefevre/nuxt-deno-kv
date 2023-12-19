import type { Kv } from '@deno/kv'

export const useKv = async (): Promise<Kv> => {
  // @ts-ignore
  if (globalThis.Deno) {
    // @ts-ignore
    return await globalThis.Deno.openKv() as Kv
  }
  if (process.dev) {
    const OpenKV = () => import('@deno/kv')
    const { openKv } = await OpenKV()
    return await openKv('kv.db') as Kv
  }
  throw createError({
    statusCode: 500,
    message: 'Could not find a Deno KV for production, make sure to deploy on Deno Deploy.'
  })
}