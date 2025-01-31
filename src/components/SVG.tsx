import { lazy, Suspense } from 'react';

const SVGMap = {
	'ice-cube': () => import('../assets/svgs/ice-cube.svg'),
	'minus': () => import('../assets/svgs/icon-minus.svg'),
	'pencil': () => import('../assets/svgs/icon-pencil.svg'),
	'play-button': () => import('../assets/svgs/icon-play.svg'),
	'plus': () => import('../assets/svgs/icon-plus.svg'),
	'rewind': () => import('../assets/svgs/icon-rewind.svg'),
	'caret': () => import('../assets/svgs/icon-caret.svg')
} as const;

export type SVGName = keyof typeof SVGMap;

interface SVGProps {
	name: SVGName;
}

const SVG: React.FC<SVGProps> = ({ name }) => {
	const LazyComponent = lazy(() =>
		SVGMap[name]().then(module => ({
			default: (module as any).default
		}))
	);

	return (
		<Suspense>
			<LazyComponent />
		</Suspense>
	);
}

export default SVG;