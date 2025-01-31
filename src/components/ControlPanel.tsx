import '../App.css';
import SVG from './SVG';
import StackInput from './StackInput';
import { useStacksData } from '../context/stacksContext';

const ControlPanel = () => {

	const { 
		setMouseControl, 
		setLeftCount, 
		setRightCount, 
		resetConnections, 
		mouseControl,
		isPlaying,
		setIsPlaying,
		connections,
		isControlPanelOpen,
		handleControlAction
	} = useStacksData();

	// Handle mouse control picker
	const handleMouseControl = (control: 'update' | 'compare' ) => {
		setMouseControl(control);
		handleControlAction();
	};

	// Handle reset when clicking "Reset" button
	const handleReset = () => {

		setLeftCount(1);
		setRightCount(1);
		setIsPlaying(false);
		setMouseControl('update');
		if ( resetConnections ) {
			resetConnections();
		}
		
	};

	// Handle play button
	const handlePlay = () => {
		setIsPlaying(!isPlaying);
		handleControlAction();
	};

	// Keep play button disabled until both connections are made
	const isPlayDisabled = connections.length < 2;

	return (
		<section className={`control-panel-wrapper ${isControlPanelOpen ? 'active' : ''}`}>
			<h1>Math Comparators</h1>

			<div className="control-panel">
				<div className="stacks">
					<h3 className="eyebrow">Stacks</h3>

					<StackInput position="left" />
					<StackInput position="right" />

				</div>

				<div className="mouse-controls">
					<h3 className="eyebrow">Mouse Controls</h3>

					<button type="button" className={`btn update ${mouseControl === 'update' ? 'active' : ''}`} onClick={() => handleMouseControl('update')}><span className="accessibility">Add/Remove</span><SVG name="plus" /><SVG name="minus" /></button>
					<button type="button" className={`btn compare ${mouseControl === 'compare' ? 'active' : ''}`} onClick={() => handleMouseControl('compare')}><span className="accessibility">Draw/Compare</span><SVG name="pencil" /></button>
				</div>

				<button 
					type="button" 
					className="btn play" 
					onClick={handlePlay}
					disabled={isPlayDisabled}
				>
					<span className="accessibility">Play comparator animation</span>
					{
						!isPlaying || isPlayDisabled ? <SVG name="play-button"/> : <SVG name="rewind" />
					}
					
				</button>
				<button type="button" className="btn reset" onClick={handleReset}>Reset</button>
			</div>
		</section>
	);
}

export default ControlPanel;