import { makeHookEntry } from './lib/hook-proxy'
import { useState, useContext } from 'react'
import { useAsync } from './lib/use-async'
export type ReturnType<TMethod> = TMethod extends (...args: infer A) => infer TReturnType
  ? TReturnType
  : never
export type DeAsyncReturnType<TMethod> = TMethod extends (
  ...args: infer A
) => Promise<infer TReturnType>
  ? TReturnType
  : never
export type FirstArgumentType<TMethod> = TMethod extends (first: infer TFirst) => any
  ? TFirst
  : never
export type SecondArgumentType<TMethod> = TMethod extends (_: any, second: infer TSecond) => any
  ? TSecond
  : never
export function safeHook<T extends Function>(
  hookMethod: T,
  input?: FirstArgumentType<T>,
  options?: SecondArgumentType<T>
): ReturnType<T> {
  return makeHookEntry([hookMethod, input, options])
}
export function safeStateHook<T>(input: T): [T, (value: T) => void] {
  return makeHookEntry([useState, input])
}
export function safeAsyncHook<T extends (this: any, ...args: any[]) => any>(
  promiseFn: T,
  opts?: SecondArgumentType<typeof useAsync>
): [(arg?: FirstArgumentType<T>) => void, DeAsyncReturnType<T> | { error: any }, boolean] {
  return safeHook(useAsync, promiseFn as any, opts) as any
}
export function safeContextHook<T extends React.Context<any>>(
  context: T
): T extends React.Context<infer C> ? C : never {
  return safeHook(useContext, context) as any
}
