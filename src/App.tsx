import './App.css';
import { StacksProvider } from './context/stacksContext';
import MCLearningApp from './components/MCLearningApp';

function App() {

	return (
		<StacksProvider>
			<MCLearningApp />;
		</StacksProvider>
	);

}

export default App;