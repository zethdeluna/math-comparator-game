import React, { useState, useEffect, useRef, useMemo } from 'react';
import { debounce } from 'lodash';
import { useStacksData } from '../context/stacksContext';
import type { Position, ActiveButton, Connection } from './InteractiveWindow';

interface LineCoordinates {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

interface ConnectionLinesProps {
	activeButton: ActiveButton | null;
	connections: Connection[];
}

const AnimatedConnectionLine: React.FC<{
	start: Position;
	end: Position;
	isTopLine: boolean;
	isPlaying: boolean;
	svgRef: React.RefObject<SVGSVGElement>;
	symbol?: '<' | '>' | '=';
}> = React.memo(({ start, end, isTopLine, isPlaying, svgRef, symbol }) => {
	const lineRef = useRef<SVGLineElement>(null);
	const animationRef = useRef<number>();
	const [coords, setCoords] = useState<LineCoordinates>({
		x1: start.x,
		y1: start.y,
		x2: end.x,
		y2: end.y
	});

  	const getTargetCoordinates = (): LineCoordinates => {
		if (!isPlaying || !svgRef.current) {
			return start.x < end.x
				? { x1: start.x, y1: start.y, x2: end.x, y2: end.y }
				: { x1: end.x, y1: end.y, x2: start.x, y2: start.y };
		}

		// Get SVG dimensions
		const svgRect = svgRef.current.getBoundingClientRect();
		const centerX = svgRect.width / 2;
		const centerY = svgRect.height / 2;

		// Fixed dimensions for the symbols
		const length = Math.abs(end.x - start.x);
		const symbolWidth = length * 0.15;   // Width of each line segment
		const symbolHeight = length * 0.1;  // Vertical gap between lines
		// const xOffset = 30;
		// const yOffset = 26;
		const xOffset = length * 0.1;
		const yOffset = length * 0.08;
    
		if (symbol === '>') {
			if (isTopLine) {
				return {
					x1: centerX - symbolWidth + xOffset,  // Left point
					y1: centerY - symbolHeight - yOffset, // Upper point
					x2: centerX + xOffset,                // Center point
					y2: centerY - yOffset             // Center point
				};
			} else {
				return {
					x1: centerX - symbolWidth + xOffset,  // Left point
					y1: centerY + symbolHeight - yOffset, // Lower point
					x2: centerX + xOffset,                // Center point
					y2: centerY - yOffset               // Center point
				};
			}
		}
    
		if (symbol === '<') {
			if (isTopLine) {
				return {
					x1: centerX - xOffset,                // Center point
					y1: centerY - yOffset,                // Center point
					x2: centerX + symbolWidth - xOffset,  // Right point
					y2: centerY - symbolHeight - yOffset  // Upper point
				};
			} else {
				return {
					x1: centerX - xOffset,                // Center point
					y1: centerY - yOffset,                // Center point
					x2: centerX + symbolWidth - xOffset,  // Right point
					y2: centerY + symbolHeight - yOffset  // Lower point
				};
			}
		}
    
		// For equals sign
		return {
			x1: centerX - symbolWidth + 20,
			y1: centerY + (isTopLine ? -symbolHeight/2 : symbolHeight/2) - yOffset,
			x2: centerX + symbolWidth - 20,
			y2: centerY + (isTopLine ? -symbolHeight/2 : symbolHeight/2) - yOffset
		};
  	};

  	useEffect(() => {
		const targetCoords = getTargetCoordinates();
		
		const startTime = performance.now();
		const duration = 750; // Animation duration in ms
    
		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Easing function (ease-out-cubic)
			const eased = 1 - Math.pow(1 - progress, 3);
			
			const current = {
				x1: coords.x1 + (targetCoords.x1 - coords.x1) * eased,
				y1: coords.y1 + (targetCoords.y1 - coords.y1) * eased,
				x2: coords.x2 + (targetCoords.x2 - coords.x2) * eased,
				y2: coords.y2 + (targetCoords.y2 - coords.y2) * eased
			};
			
			if (lineRef.current) {
				lineRef.current.setAttribute('x1', current.x1.toString());
				lineRef.current.setAttribute('y1', current.y1.toString());
				lineRef.current.setAttribute('x2', current.x2.toString());
				lineRef.current.setAttribute('y2', current.y2.toString());
			}
			
			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate);
			} else {
				setCoords(targetCoords);
			}
		};

    	animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
  	}, [isPlaying, symbol]);

	return (
		<line
			ref={lineRef}
			{...coords}
			stroke="#BBDEFF"
			strokeWidth="14"
			strokeLinecap="round"
		/>
	);
});

const DrawingLine: React.FC<{
	start: Position;
	end: Position;
}> = ({ start, end }) => (
	<line
		x1={start.x}
		y1={start.y}
		x2={end.x}
		y2={end.y}
		stroke="#BBDEFF"
		strokeWidth="14"
		strokeLinecap="round"
	/>
);

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ 
	activeButton, 
	connections
}) => {
	const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
	const [drawLineOpacity, setDrawLineOpacity] = useState<number>(0);
	const svgRef = useRef<SVGSVGElement>(null);
	const { leftCount, rightCount, isPlaying } = useStacksData();

	const debouncedSetMousePosition = useMemo(
		() => debounce((x: number, y: number) => {
			setMousePosition({ x, y });
		}, 4),
		[]
	);

  	useEffect(() => {
		if (!activeButton) {
			setDrawLineOpacity(0);
			return;
		}

		const handleMouseMove = (e: MouseEvent) => {
			debouncedSetMousePosition(e.clientX - 80, e.clientY - 80);
			setDrawLineOpacity(1);
		};

    	document.addEventListener('mousemove', handleMouseMove);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			debouncedSetMousePosition.cancel();
		}
  	}, [activeButton, debouncedSetMousePosition]);

	const getComparisonSymbol = () => {
		if (leftCount < rightCount) return '<';
		if (leftCount > rightCount) return '>';
		return '=';
	};

	const existingLines = useMemo(() => {
		const symbol = getComparisonSymbol();
		
		return connections.map(connection => {
			const isTopLine = connection.startButtonId.includes('button-0');
		
			return (
				<AnimatedConnectionLine 
				key={connection.id}
				start={connection.start}
				end={connection.end}
				isPlaying={isPlaying}
				isTopLine={isTopLine}
				symbol={symbol}
				svgRef={svgRef}
				/>
			);
		});
	}, [connections, isPlaying, leftCount, rightCount]);

  	return (
		<div className="connection-lines-container">
			<svg 
				ref={svgRef} 
				className="connections-svg"
				style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
				}}
			>
				{existingLines}
			</svg>
			{activeButton && (
				<svg 
				className="connections-svg"
				style={{ 
					opacity: drawLineOpacity,
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%'
				}}
				>
				<DrawingLine
					start={activeButton.position}
					end={mousePosition}
				/>
				</svg>
			)}
		</div>
  	);
};

export default ConnectionLines;