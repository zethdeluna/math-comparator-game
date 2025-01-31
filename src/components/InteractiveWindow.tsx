import '../App.css';
import { useState, useEffect } from 'react';
import Stack from './Stack';
import ConnectionLines from './ConnectionLines';
import { useStacksData } from '../context/stacksContext';

type ButtonPosition = '0' | '1';
type StackPosition = 'left' | 'right';
type ButtonId = `${StackPosition}-button-${ButtonPosition}`;

interface Position {
	x: number;
	y: number;
}

interface ActiveButton {
	id: ButtonId;
	position: Position;
}

interface Connection {
	start: Position;
	end: Position;
	id: string;
	startButtonId: ButtonId;
	endButtonId: ButtonId;
}

interface StackProps {
	position: StackPosition;
	onButtonClick: (e: React.MouseEvent<HTMLButtonElement>, buttonId: ButtonId) => void;
}

export type { ButtonId, Position, ActiveButton, Connection, StackProps }

// Helper function to calculate button center position
const getButtonCenter = (rect: DOMRect): Position => ({
	x: rect.left - rect.width * 1.5,
	y: rect.top - rect.height * 1.5
});

/**
 * Manages interactive UI with draggable blocks
 * and connection lines between 2 stacks
 */
const InteractiveWindow = () => {
	// Track buttons for drawing connections
	const [activeButton, setActiveButton] = useState<ActiveButton | null>(null);

	// Track existing connections between buttons
	// const [connections, setConnections] = useState<Connection[]>([]);

	// Get shared stack states
	const { 
		leftCount, 
		rightCount, 
		setResetConnections, 
		mouseControl, 
		isPlaying, 
		connections,
		setConnections
	} = useStacksData();

	// Remove all connections if leftCount or rightCount change
	useEffect(() => {
		
		if ( connections.length > 0 ) {
			setConnections([]);
			setActiveButton(null);
		}

	}, [leftCount, rightCount, setConnections]);

	// Remove all connections when switching to "Update" mode
	useEffect(() => {
		
		if ( mouseControl === 'update' && connections.length > 0 ) {
			setConnections([]);
			setActiveButton(null);
		}

	}, [mouseControl, connections.length, setConnections]);

	// Register function for "Reset" button in Control Panel
	useEffect(() => {
		
		setResetConnections(() => {
			return () => {
				setConnections([]);
				setActiveButton(null);
			}
		});

		return () => setResetConnections(null);

	}, [setResetConnections, setConnections]);

	// Helper function to check if a set of buttons are already connected
	const isConnected = (buttonId: ButtonId): boolean => {

		return connections.some(connection =>
			connection.startButtonId === buttonId ||
			connection.endButtonId === buttonId
		);

	};

	// Handles connecting buttons between different stacks
	const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, buttonId: ButtonId): void => {

		// If a connection exists or animation is playing, ignore the click
		if ( isConnected(buttonId) || isPlaying ) {
			return;
		}

		// Calculate button center for line ends placement
		const buttonRect = e.currentTarget.getBoundingClientRect();
		const buttonCenter = getButtonCenter(buttonRect);

		if ( !activeButton ) {

			// Initialize new connection from clicked button
			setActiveButton({
				id: buttonId,
				position: buttonCenter
			});

			return;

		}

		// Get stack and position from button IDs
		const [activeStack, , activePosition] = activeButton.id.split('-');
		const [clickedStack, , clickedPosition] = buttonId.split('-');

		// Create connection if buttons are on different stacks but same position (top or bottom)
		if ( activeStack !== clickedStack && activePosition === clickedPosition ) {
			setConnections(prev => [...prev, {
				start: activeButton.position,
				end: buttonCenter,
				id: `${activeButton.id}-to-${buttonId}`,
				startButtonId: activeButton.id,
				endButtonId: buttonId
			}]);
		}
		
		// Reset active button after completing connection
		setActiveButton(null);

	};

	return (
	<section className="interactive-window">
		<ConnectionLines 
			handleButtonClick={handleButtonClick}
			activeButton={activeButton}
			connections={connections}
		/>
		<div className="stacks-container">
			<Stack 
				position="left" 
				onButtonClick={handleButtonClick} 
				disabledButtons={connections.flatMap(conn => [conn.startButtonId, conn.endButtonId])}
			/>
			<Stack 
				position="right" 
				onButtonClick={handleButtonClick} 
				disabledButtons={connections.flatMap(conn => [conn.startButtonId, conn.endButtonId])}
			/>
		</div>
	</section>
	);
}

export default InteractiveWindow;