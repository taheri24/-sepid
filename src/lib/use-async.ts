import { useState, useEffect } from 'react'
export const useAsync = (asyncFunction: Function, { immediate = false, delay = 0 } = {}) => {
  const [output, setOutput] = useState(null)
  const setError = (error: any) => setOutput({ error } as any)
  const [inputValues, setInputValues] = useState<
    | undefined
    | {
        target?: any
        inputArgs?: any[]
        invokeTime?: number
      }
  >({})
  const trunOffPending = setInputValues.bind(null, undefined)
  function execute(this: any, ...inputArgs: any[]) {
    setInputValues({ target: this, inputArgs, invokeTime: +new Date() })
  }
  useEffect(
    function() {
      if (!inputValues || !inputValues.invokeTime) return
      const promiseResult = Promise.resolve(
        asyncFunction.apply(inputValues.target, inputValues.inputArgs)
      )
      promiseResult.then(setOutput, setError).finally(trunOffPending)
    },
    [inputValues && inputValues.invokeTime]
  )
  useEffect(
    function() {
      if (immediate) execute()
    },
    [immediate]
  )
  return [execute, output, Boolean(inputValues)]
}
