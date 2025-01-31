import type { ButtonId, Position, Connection } from "./InteractiveWindow";

/**
 * Helper function to get center position of button
 */
const getButtonCenter = (buttonId: ButtonId): Position => {

	const button = document.getElementById(buttonId);

	if ( !button ) {
		throw new Error(`Button with id ${buttonId} not  found`);
	}

	const rect = button.getBoundingClientRect();

	return {
		x: rect.left - rect.width * 1.5,
		y: rect.top - rect.height * 0.9
	};

};

/**
 * Heper function to create a connection between two buttons
 */
const createConnection = async (startButtonId: ButtonId, endButtonId: ButtonId): Promise<Connection> => {
	return new Promise((resolve) => {

		setTimeout(() => {
			const startPosition = getButtonCenter(startButtonId);
			const endPosition = getButtonCenter(endButtonId);

			resolve({
				start: startPosition,
				end: endPosition,
				id: `${startButtonId}-to-${endButtonId}`,
				startButtonId,
				endButtonId
			});
		}, 0);

	});
};

/**
 * Helper functino to generate missing connections for unconnected buttons
 */
const generateMissingConnections = async  (existingConnections: Connection[]): Promise<Connection[]> => {
	const connectedButtons = new Set(
		existingConnections.flatMap(conn => [conn.startButtonId, conn.endButtonId])
	);

	const newConnections: Connection[] = [];

	// Check top buttons
	if ( !connectedButtons.has('left-button-0') && !connectedButtons.has('right-button-0') ) {
		const topConnection = await createConnection('left-button-0', 'right-button-0');
		newConnections.push(topConnection);
	}

	// Check bottom buttons
	if ( !connectedButtons.has('left-button-1') && !connectedButtons.has('right-button-1') ) {
		const bottomConnection = await createConnection('left-button-1', 'right-button-1');
		newConnections.push(bottomConnection);
	}

	return newConnections;
};

export { generateMissingConnections };