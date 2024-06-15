// debug replaces the module debug in prod.
export default function debug() {
  function innerDebugger() {}
  innerDebugger.enabled = false
  return innerDebugger
}
