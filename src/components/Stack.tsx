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
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging && floatingBlockRef.current) {
				floatingBlockRef.current.style.left = `${e.clientX - 30}px`;
				floatingBlockRef.current.style.top = `${e.clientY - 30}px`;
			}
		};

		// Handle block removal when "dropped" outside original position
		const handleMouseUp = (e: MouseEvent) => {
			if (isDragging && originalBlockPosition.current) {
				const { left, right, top, bottom } = originalBlockPosition.current;

				if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) {
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
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		// Clean up event listeners
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

	}, [isDragging, count, setCount]);

	// Initialize drag event
	const startDrag = useCallback((e: React.MouseEvent, index: number) => {
		e.preventDefault();
		setIsDragging(true);
		setDraggedBlockIndex(index);
		originalBlockPosition.current = e.currentTarget.getBoundingClientRect();
		
		if (floatingBlockRef.current) {
			floatingBlockRef.current.style.left = `${e.clientX - 30}px`;
			floatingBlockRef.current.style.top = `${e.clientY - 30}px`;
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