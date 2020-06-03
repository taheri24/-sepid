import { useState, useEffect } from 'react'
export const useAsync = (asyncFunction: Function, { immediate = false, delay = 0 } = {}) => {
  const [pending, setPending] = useState<true | undefined>(undefined)
  const [output, setOutput] = useState(null)
  const setError = (error: any) => setOutput({ error } as any)
  const trunOffPending = setPending.bind(null, undefined)
  const [inputValues, setInputValues] = useState<{
    target?: any
    inputArgs?: any[]
    invokeTime?: number
  }>({})
  function execute(this: any, ...inputArgs: any[]) {
    setPending(true)
    setInputValues({ target: this, inputArgs, invokeTime: +new Date() })
  }
  useEffect(
    function() {
      if (!inputValues.invokeTime) return
      const promiseResult = Promise.resolve(
        asyncFunction.apply(inputValues.target, inputValues.inputArgs)
      )
      promiseResult.then(setOutput, setError).finally(trunOffPending)
    },
    [inputValues.invokeTime]
  )
  useEffect(
    function() {
      if (immediate) execute()
    },
    [immediate]
  )
  return [execute, output, pending]
}
