const hookProxyHandler: ProxyHandler<{ __hookEntry: IHookEntry }> = {
  get(target: any, key, receiver) {
    if (key in target) return target[key]
    if (key.toString().startsWith('__')) return Reflect.get(target, key, receiver)
    if (key in target.__hookEntry) return target.__hookEntry[key]
    return makeHookProxy({ parent: target.__hookEntry, path: key as string })
  }
}
function hookProxy() {
  throw new Error(`you can not call this hook . please use this.hookName`)
}
export function makeHookProxy(hookEntry: IHookEntry, entry?: IHookEntry) {
  const fn: any = Object.assign(
    hookProxy.bind(null, hookEntry),
    { __hookEntry: hookEntry },
    entry || {}
  )
  fn[Symbol.iterator] = hookProxyIterator
  return new Proxy(fn, hookProxyHandler)
}
export interface IHookEntry {
  exportedName?: string
  parent?: IHookEntry
  hook?: [Function, any?, any?]
  hookId?: number
  innerIndex?: number
  path?: string
  hookEntryName?: string
}
let hookIdCounter = 0
function hookProxyIterator(this: any) {
  return {
    hookEntry: this.__hookEntry,
    current: 0,
    next() {
      const value = makeHookProxy({ parent: this.hookEntry, innerIndex: this.current++ })
      return { done: false, value }
    }
  }
}
export function makeHookEntry(hook: IHookEntry['hook']) {
  const hookEntry: IHookEntry = { hook, hookId: ++hookIdCounter }
  return makeHookProxy(hookEntry)
}
