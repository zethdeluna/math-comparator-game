import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";
import { useStacksData } from "../context/stacksContext";

interface StackInputProps {
	position: 'left' | 'right';
}

/**
 * Numeric input component for controlling stack count
 */
const StackInput: React.FC<StackInputProps> = ({ position }) => {

	// Get shared stack states
	const { leftCount, rightCount, setLeftCount, setRightCount } = useStacksData();
	const [value, setValue] = useState<string>('1');

	// Memoize count and count setter
	const { currentCount, setCount } = useMemo(() => ({
		currentCount: position === 'left' ? leftCount : rightCount,
		setCount: position === 'left' ? setLeftCount : setRightCount
	}), [position, leftCount, rightCount, setLeftCount, setRightCount]);

	// update input values when stsack counts change
	useEffect(() => {

		setValue(currentCount.toString());
		
	}, [currentCount]);

	// Validate input values
	const validateInput = useCallback((inputValue: string): string => {

		if ( inputValue === '' ) return '';

		const num = Number(inputValue);
		if ( num < 1 ) return '1';
		if ( num > 10 ) return '10';

		return inputValue;

	}, []);

	// Handle input changes with validation limiting the range to 1-10
	const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {

		const newValue = validateInput(e.target.value);
		setValue(newValue);

		const updatedNum = newValue === '' ? 1 : Math.min(Math.max(Number(newValue), 1), 10);
		setCount(updatedNum);

	}, [setCount, validateInput]);

	// Reset value to 1 user clicks away while the input is empty
	const handleClickOut = useCallback(() => {

		if ( value === '' ) {
			setValue('1');
			setCount(1);
		}

	}, [value, setCount]);

	// Memoize input label
	const inputLabel = useMemo(() => 
		position.charAt(0).toUpperCase() + position.slice(1),
		[position]
	);

	return (
		<div className={`stack-input ${position}`}>
			<label htmlFor={`${position}-stack`}>{inputLabel}</label>
			<input
				type="number" 
				id={`${position}-stack`} 
				name={`${position}-stack`} 
				value={value} 
				onChange={handleInput} 
				onBlur={handleClickOut} 
				min={1} 
				max={10} 
				aria-label={`${inputLabel} stack count`}
			/>
		</div>
	);
}

export default StackInput;