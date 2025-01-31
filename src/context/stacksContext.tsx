import { createContext, useContext, useState, useEffect } from "react";
import type { Connection } from "../components/InteractiveWindow";

/**
 * Provides shared state management for
 * stack counts and mouse interactions
 */

interface StacksContextProps {
	leftCount: number;
	rightCount: number;
	setLeftCount: (count: number) => void;
	setRightCount: (count: number) => void;
	mouseControl: 'update' | 'compare';
	setMouseControl: (control: 'update' | 'compare') => void;
	resetConnections: (() => void) | null;
	setResetConnections: (resetFn: (() => void) | null) => void;
	isPlaying: boolean;
	setIsPlaying: (playing: boolean) => void;
	connections: Connection[];
	setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
	isControlPanelOpen: boolean;
	setControlPanelOpen: (isOpen: boolean) => void;
	handleControlAction: () => void;
}

const StacksContext = createContext<StacksContextProps | undefined>(undefined);

// Initialize context with stack counts and interaction mode
const StacksProvider = ({ children }: { children: React.ReactNode }) => {
	const [leftCount, setLeftCount] = useState(1);
	const [rightCount, setRightCount] = useState(1);
	const [mouseControl, setMouseControl] = useState<'update' | 'compare'>('update');
	const [resetConnections, setResetConnections] = useState<(() => void) | null>(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [connections, setConnections] = useState<Connection[]>([]);
	const [isControlPanelOpen, setControlPanelOpen] = useState<boolean>(false);

	// Stop animation if counts or mouse control change
	useEffect(() => {
		
		if ( isPlaying ) {
			setIsPlaying(false);
		}

	}, [leftCount, rightCount, mouseControl]);

	// Helper function to handle all control panel actions for tablet/mobile
	const handleControlAction = () => {

		if ( window.innerWidth <= 950 ) {
			setControlPanelOpen(false);
		}

	};

	return (
		<StacksContext.Provider
			value={{
				leftCount,
				rightCount,
				setLeftCount,
				setRightCount,
				mouseControl,
				setMouseControl,
				resetConnections,
				setResetConnections,
				isPlaying,
				setIsPlaying,
				connections,
				setConnections,
				isControlPanelOpen,
				setControlPanelOpen,
				handleControlAction
			}}
		>
			{children}
		</StacksContext.Provider>
	);
}

// Hook to access stacks context
const useStacksData = () => {
	const context = useContext(StacksContext);
	if ( context === undefined ) {
		throw new Error('useStacksData must be used within a StacksProvider');
	}

	return context;
}

export { StacksProvider, useStacksData };