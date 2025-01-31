import '../App.css';
import { useStacksData } from '../context/stacksContext';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SVG from './SVG';
import type { ButtonId, StackProps } from './InteractiveWindow';

/**
 * Hook to manage drag & drop
 */
const useDragAndDrop = (count: number, setCount: (newCount: number) => void) => {
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
	const [isFloatingVisible, setIsFloatingVisible] = useState<boolean>(false);
	const floatingBlockRef = useRef<HTMLDivElement>(null);
	const originalBlockPosition = useRef<DOMRect | null>(null);

	useEffect(() => {

		// Update floating block position while dragging
		const handleMove = (e: MouseEvent | TouchEvent) => {
			if (isDragging && floatingBlockRef.current) {
				const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
				const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

				floatingBlockRef.current.style.left = `${clientX - 30}px`;
				floatingBlockRef.current.style.top = `${clientY - 30}px`;
			}
		};

		// Handle block removal when "dropped" outside original position
		const handleRelease = (e: MouseEvent | TouchEvent) => {
			if (isDragging && originalBlockPosition.current) {
				const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
				const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

				const { left, right, top, bottom } = originalBlockPosition.current;

				if (clientX < left || clientX > right || clientY < top || clientY > bottom) {
					setCount(Math.max(count - 1, 1));
				}
			}

			// Reset drag state
			setIsDragging(false);
			setDraggedBlockIndex(null);
			setIsFloatingVisible(false);
			originalBlockPosition.current = null;
		};

		// Add event listeners
		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleRelease);
		document.addEventListener('touchmove', handleMove, { passive: false });
		document.addEventListener('touchend', handleRelease);
		document.addEventListener('touchcancel', handleRelease);

		// Clean up event listeners
		return () => {
			document.removeEventListener('mousemove', handleMove);
			document.removeEventListener('mouseup', handleRelease);
			document.removeEventListener('touchmove', handleMove);
			document.removeEventListener('touchend', handleRelease);
			document.removeEventListener('touchcancel', handleRelease);
		};

	}, [isDragging, count, setCount]);

	// Initialize drag event
	const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, index: number) => {
		e.preventDefault();
		setIsDragging(true);
		setDraggedBlockIndex(index);

		const target = e.currentTarget;
		originalBlockPosition.current = target.getBoundingClientRect();
		
		if (floatingBlockRef.current) {

			const clientX = 'touches' in e.nativeEvent 
				? e.nativeEvent.touches[0].clientX 
				: (e as React.MouseEvent).clientX;
			;
			const clientY = 'touches' in e.nativeEvent 
				? e.nativeEvent.touches[0].clientY 
				: (e as React.MouseEvent).clientY;
			;

			floatingBlockRef.current.style.left = `${clientX - 30}px`;
			floatingBlockRef.current.style.top = `${clientY - 30}px`;
			setIsFloatingVisible(true);
		}

	}, []);

	return {
		isDragging,
		draggedBlockIndex,
		isFloatingVisible,
		floatingBlockRef,
		startDrag
	}

};

/**
 * Renders a stack of draggable blocks and connection points
 */
interface ExtendedStackProps extends StackProps {
	disabledButtons: ButtonId[];
}

const Stack: React.FC<ExtendedStackProps> = ({ position, onButtonClick, disabledButtons }) => {
	// Get shared stack states
	const {
		leftCount, 
		rightCount, 
		setLeftCount, 
		setRightCount, 
		mouseControl, 
		isPlaying
	} = useStacksData();
	
	// Memoize count
	const count = useMemo(() => 
		position === 'left' ? leftCount : rightCount,
		[position, leftCount, rightCount]
	);

	// Memoize setCount
	const setCount = useMemo(() =>
		position === 'left' ? setLeftCount : setRightCount,
		[position, setLeftCount, setRightCount]
	);

	// Use drag & drop hook
	const {
		isDragging,
		draggedBlockIndex,
		isFloatingVisible,
		floatingBlockRef,
		startDrag
	} = useDragAndDrop(count, setCount);

	// Memoize increment handler
	const handleIncrement = useCallback(() => {

		if ( !isDragging ) {
			setCount(Math.min(count +1, 10));
		}

	}, [isDragging, count, setCount]);

	// Helper function to check if button is disabled
	const isButtonDisabled = (buttonIndex: string): boolean => {

		const buttonId = `${position}-button-${buttonIndex}` as ButtonId;
		return disabledButtons.includes(buttonId);

	};

	// Hide connection buttons if animation is playing
	const showCompareButtons = !isPlaying && mouseControl === 'compare';

	return (
		<>
			<div className="stack-container">
				<div className="stack-wrapper">
					{showCompareButtons && (
						<button 
							type="button" 
							id={`${position}-button-0`}
							className={`compare-line ${isButtonDisabled('0') ? 'connected' : ''}`}
							onClick={(e) => onButtonClick(e, `${position}-button-0` as ButtonId)}
							disabled={isButtonDisabled('0')}
						/>
					)}

					<div 
						className={`stack ${position} ${mouseControl === 'compare' ? 'disabled' : ''}`} 
						onClick={handleIncrement}
					>
						{Array.from({ length: count }).map((_, index) => (
						<div 
							key={index} 
							className={`block ${draggedBlockIndex === index ? 'being-dragged' : ''}`} 
							onMouseDown={(e) => startDrag(e, index)}
							onTouchStart={(e) => startDrag(e, index)}
							style={{ touchAction: 'none' }}
						>
							<SVG name="ice-cube" />
						</div>
						))}
					</div>

					{showCompareButtons && (
						<button 
							type="button" 
							id={`${position}-button-1`}
							className={`compare-line ${isButtonDisabled('1') ? 'connected' : ''}`}
							onClick={(e) => onButtonClick(e, `${position}-button-1` as ButtonId)}
							disabled={isButtonDisabled('1')}
						/>
					)}
				</div>

				<p className="stack-count">{count}</p>
			</div>

			<div ref={floatingBlockRef} className={`floating-block ${isFloatingVisible ? 'visible' : ''}`}>
				<SVG name="ice-cube" />
			</div>
		</>
	);
}

export default Stack;