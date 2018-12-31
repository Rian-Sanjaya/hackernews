import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import App, { Search, Button } from './App';

// implement a snapshot test for the App component
// Once you change the output of the render block in the App component, the snapshot test should fail. 
// Then you can decide to update the snapshot or investigate in the App component.
describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  // The renderer.create() function creates a snapshot of the App component. 
  // It renders it virtually, and then stores the DOM into a snapshot. 
  // Afterward, the snapshot is expected to match the previous version from the last test. 
  // This is how we make sure the DOM stays the same and doesn’t change anything by accident.
  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

// implement a snapshot test for the Search component
describe('Search', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Search>Search</Search>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("Button", () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button>Give Me More</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button>Give Me More</Button>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});