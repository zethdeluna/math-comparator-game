import '../App.css';
import InteractiveWindow from './InteractiveWindow';
import ControlPanel from './ControlPanel';
import SVG from './SVG';
import { useStacksData } from '../context/stacksContext';

const MCLearningApp = () => {

	const {
		isControlPanelOpen,
		setControlPanelOpen
	} = useStacksData();

	return (
		<div className="mc-learning-app">
			<InteractiveWindow />
			<ControlPanel />
			<button
				className="btn tablet-control-button"
				onClick={() => setControlPanelOpen(!isControlPanelOpen)}
				aria-expanded={isControlPanelOpen}
				aria-label={`${isControlPanelOpen ? 'Close' : 'Open'} control panel`}
			>
				<span className="accessibility">Open control panel</span>
				<SVG name="caret" />
			</button>
		</div>
	);
}

export default MCLearningApp;