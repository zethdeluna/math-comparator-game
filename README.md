# Math Comparators Learning App

An interactive React TypeScript application designed to help students understand mathematical comparison operators (<, >, =) through visual block stacking and comparison.

## Features

- **Interactive Block Stacks**: Two stacks that can each hold up to 10 blocks
  - Click to add blocks
  - Drag blocks away to remove them
  - Numeric input controls for precise stack heights

- **Comparison Mode**: Draw connections between stacks to compare their values
  - Connect corresponding points (top-to-top or bottom-to-bottom)
  - Visual feedback for valid/invalid connections
  - Animated transformation into comparison symbols (<, >, =)

- **Control Panel**:
  - Toggle between Update (add/remove blocks) and Compare modes
  - Direct numeric input for stack heights (1-10)
  - Play button to animate comparisons
  - Reset functionality to clear all connections

- **Responsive Design**:
  - Tablet-friendly interface with collapsible control panel
  - Touch-enabled drag and drop
  - Smooth animations and transitions

## Technical Stack

- React 
- TypeScript
- Context API for state management
- SVG for dynamic line drawing and animations
- Lodash for utility functions

## Usage

1. **Adding/Removing Blocks**:
   - Click on a stack to add blocks
   - Drag blocks away from the stack to remove them
   - Use the numeric inputs in the control panel for precise values

2. **Drawing Comparisons**:
   - Switch to Compare mode using the pencil icon
   - Click connection points at the top or bottom of stacks to draw comparison lines
   - Both top and bottom connections must be made for the comparison to work

3. **Viewing Results**:
   - Press the Play button to animate the comparison lines
   - Lines will transform to show the appropriate comparison symbol
   - Reset to clear all connections and start over

## Component Structure

- `MCLearningApp`: Main application container
- `InteractiveWindow`: Manages the visual workspace
- `ControlPanel`: Houses all control interfaces
- `Stack`: Individual block stack component
- `ConnectionLines`: Handles drawing and animating comparison lines