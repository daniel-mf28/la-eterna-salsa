import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const isDown = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const handleMouseDown = (e: MouseEvent) => {
            isDown.current = true
            element.style.cursor = 'grabbing'
            element.style.userSelect = 'none'
            startX.current = e.pageX - element.offsetLeft
            scrollLeft.current = element.scrollLeft
        }

        const handleMouseLeave = () => {
            isDown.current = false
            element.style.cursor = 'grab'
            element.style.userSelect = 'auto'
        }

        const handleMouseUp = () => {
            isDown.current = false
            element.style.cursor = 'grab'
            element.style.userSelect = 'auto'
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown.current) return
            e.preventDefault()
            const x = e.pageX - element.offsetLeft
            const walk = (x - startX.current) * 2 // Scroll speed multiplier
            element.scrollLeft = scrollLeft.current - walk
        }

        // Touch events for mobile
        const handleTouchStart = (e: TouchEvent) => {
            startX.current = e.touches[0].pageX - element.offsetLeft
            scrollLeft.current = element.scrollLeft
        }

        const handleTouchMove = (e: TouchEvent) => {
            const x = e.touches[0].pageX - element.offsetLeft
            const walk = (x - startX.current) * 2
            element.scrollLeft = scrollLeft.current - walk
        }

        element.addEventListener('mousedown', handleMouseDown)
        element.addEventListener('mouseleave', handleMouseLeave)
        element.addEventListener('mouseup', handleMouseUp)
        element.addEventListener('mousemove', handleMouseMove)
        element.addEventListener('touchstart', handleTouchStart, { passive: true })
        element.addEventListener('touchmove', handleTouchMove, { passive: true })

        // Set initial cursor
        element.style.cursor = 'grab'

        return () => {
            element.removeEventListener('mousedown', handleMouseDown)
            element.removeEventListener('mouseleave', handleMouseLeave)
            element.removeEventListener('mouseup', handleMouseUp)
            element.removeEventListener('mousemove', handleMouseMove)
            element.removeEventListener('touchstart', handleTouchStart)
            element.removeEventListener('touchmove', handleTouchMove)
        }
    }, [])

    return ref
}
