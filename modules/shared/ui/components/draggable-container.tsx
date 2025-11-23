import { useState, useEffect, useRef } from "react";


export const DraggableContainer = ({ 
    children, 
    onDragEnd, 
    initialPosition, 
    subWindowWidthBy,
    heightBound,
    targetClassName 
}: { 
    children: React.ReactNode, 
    onDragEnd: (currentPosition: { x: number, y: number }) => void, 
    initialPosition: { x: number, y: number } | null, 
    subWindowWidthBy?: number,
    heightBound?: number,
    targetClassName: string }) => {

    const padding = 10;
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = useState(initialPosition || { x: 20, y: 20 });
    const currentPositionRef = useRef(currentPosition);
    const animationFrameRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    useEffect(() => {
        currentPositionRef.current = currentPosition;
    }, [currentPosition]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!e.target || !(e.target as Element).closest(targetClassName)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragStartY(e.clientY);
        setDragStartPosition(currentPosition);

        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;

            const newX = dragStartPosition.x + deltaX;
            const newY = dragStartPosition.y + deltaY;

            // Get actual component dimensions from the DOM
            const componentHeight = containerRef.current?.offsetHeight || 600;
            const componentWidth = containerRef.current?.offsetWidth || 350;
            
            const maxX = window.innerWidth - (subWindowWidthBy ?? 0);
            const maxY = heightBound ? heightBound : window.innerHeight;
            const clampedX = clampWithinBounds(newX, maxX - componentWidth - padding, padding);
            const clampedY = clampWithinBounds(newY, maxY - componentHeight - padding, padding);

            setCurrentPosition({ x: clampedX, y: clampedY });
        });
    }

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd(currentPosition);
            document.body.style.userSelect = '';
        }
    }

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStartX, dragStartY, dragStartPosition, currentPosition]);

    useEffect(() => {
        if (!containerRef.current) return;

        const componentWidth = containerRef.current.offsetWidth;
        // clamping logic. maybe factor out.
        const maxX = window.innerWidth - (subWindowWidthBy ?? 0);
        const currentPos = currentPositionRef.current;
        const clampedX = clampWithinBounds(currentPos.x, maxX - componentWidth - padding, padding);

        if (clampedX !== currentPos.x) {
            setCurrentPosition(prev => ({ ...prev, x: clampedX }));
        }
    }, [subWindowWidthBy]);

    // Handle window resize and tab visibility changes to recalculate clamped position
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;

            const componentWidth = containerRef.current.offsetWidth;
            const componentHeight = containerRef.current.offsetHeight;
            
            // clamping logic
            const maxX = window.innerWidth - (subWindowWidthBy ?? 0);
            const maxY = heightBound ? heightBound : window.innerHeight;
            const currentPos = currentPositionRef.current;
            const clampedX = clampWithinBounds(currentPos.x, maxX - componentWidth - padding, padding);
            const clampedY = clampWithinBounds(currentPos.y, maxY - componentHeight - padding, padding);

            if (clampedX !== currentPos.x || clampedY !== currentPos.y) {
                setCurrentPosition({ x: clampedX, y: clampedY });
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleResize();
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [subWindowWidthBy, heightBound]);


    return (
        <div 
            ref={containerRef}
            className="draggable-container fixed z-high" 
            onMouseDown={(e) => handleMouseDown(e)}
            style={{
                left: currentPosition.x,
                top: currentPosition.y,
                cursor: isDragging ? 'grabbing' : 'default',
                transition: isDragging ? 'none' : 'left 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {children}
        </div>
    )
}

const clampWithinBounds = (desiredCoord: number, maxCoord: number, minCoord: number) => {
    return Math.max(minCoord, Math.min(maxCoord, desiredCoord));
}