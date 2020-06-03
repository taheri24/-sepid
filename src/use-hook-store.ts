import { useState } from 'react'
import { StoreResolver } from './lib/store-resolver'
export function useHookStore<AD>(abstractData: AD) {
  const [storeResolver] = useState(() => new StoreResolver(abstractData))
  return storeResolver.accquireHooks()
}
