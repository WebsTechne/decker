import { useEffect, useRef } from "react"

export function useVisualViewport(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !window.visualViewport) return

    const handler = () => {
      if (!ref.current || !window.visualViewport) return
      const offsetFromBottom =
        window.innerHeight -
        window.visualViewport.height -
        window.visualViewport.offsetTop

      ref.current.style.transform = `translateY(-${offsetFromBottom}px)`
    }

    window.visualViewport.addEventListener("resize", handler)
    window.visualViewport.addEventListener("scroll", handler)

    return () => {
      window.visualViewport?.removeEventListener("resize", handler)
      window.visualViewport?.removeEventListener("scroll", handler)
    }
  }, [enabled])

  return ref
}
