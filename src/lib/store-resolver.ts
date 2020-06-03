import { IHookEntry } from './hook-proxy'
export class StoreResolver<TAbstractData> {
  lockCount = 0
  hookEntries: [string, IHookEntry][]
  hookResultById: any
  constructor(public rawStore: TAbstractData) {
    this.hookEntries = Object.entries(rawStore)
      .map(([key, fn]) => (fn as any).__hookEntry && [key, (fn as any).__hookEntry])
      .filter(Boolean) as Array<[string, IHookEntry]>
    for (const [exportedName, hookEntry] of this.hookEntries) {
      hookEntry.exportedName = exportedName
    }
  }
  accquireHooks(): TAbstractData {
    this.hookResultById = {}
    const resultEntries = this.hookEntries.map(([key, hookEntry]) => [
      key,
      this.accessHook(hookEntry)
    ])
    const result = Object.fromEntries(resultEntries) as any
    for (const [key, value] of resultEntries) {
      if (value instanceof Function) result[key] = value.bind(result)
    }
    return result
  }
  accessHook(hookEntry: IHookEntry, readOnly?: Boolean) {
    const hook = hookEntry.hook || (hookEntry.parent && hookEntry.parent.hook)
    const hookId = hookEntry.hookId || (hookEntry.parent && hookEntry.parent.hookId)
    if (!hook) throw `(!hookEntry.hook)`
    const [hookMethod, ...hookArgs] = hook
    if (!hookId) throw `!hookEntry.hookId`
    for (let i = 0; i < 2; i++) {
      const existsHookResult = this.hookResultById[hookId]
      if (existsHookResult) {
        let preResult
        if (typeof hookEntry.innerIndex == 'number') {
          if (existsHookResult instanceof Array) {
            preResult = existsHookResult[hookEntry.innerIndex]
          } else throw new Error(`check Hook:${hookEntry.exportedName},Array issue`)
        } else preResult = existsHookResult
        return !hookEntry.path ? preResult : Reflect.get(preResult, hookEntry.path)
      }
      if (readOnly) throw new Error(`access Hook:${hookEntry.exportedName} fail`)
      this.hookResultById[hookId] = hookMethod(...hookArgs)
    }
    throw new Error(`access Hook:${hookEntry.exportedName} fail- lastCycle`)
  }
  evalHook(hookEntry: IHookEntry) {
    if (!hookEntry.parent || !hookEntry.path) return this.accessHook(hookEntry)
    const parentResult: any = this.evalHook(hookEntry.parent)
    return parentResult[hookEntry.path]
  }
}
