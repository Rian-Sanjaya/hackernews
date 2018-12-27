import React, { Component } from 'react';
import './App.css';

const list = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  }, 
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  }, 
];

const filterSearch = searchTerm => 
  item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: list,
      searchTerm: ''
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  onDismiss = (id) => {
    const updatedList = this.state.list.filter( item => item.objectID !== id );
    this.setState({ list: updatedList });
  };

  // When using a handler in your element, you get access to the synthetic React event in your callback function’s signature.
  // The event has the value of the input field in its target object, 
  // so you can update the local state with a search term using this.setState().
  onSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value
    });
  };

  render() {
    const { searchTerm, list } = this.state;

    return (
      <div className="App">
        <Search 
          onSearchChange={this.onSearchChange}
          searcTerm={searchTerm}
        >
          Search
        </Search>
        <List 
          list={list} 
          searchTerm={searchTerm}
          onDismiss={this.onDismiss}
        />
      </div>
    );
  }
}

export default App;

class Search extends Component {
  render() {
    const {onSearchChange, searchTerm, children} = this.props;

    return (
      <form>
        {children}&nbsp;
        <input 
          type="text" 
          onChange={onSearchChange} 
          value={searchTerm}
        />
      </form>
    );
  }
}

class List extends Component {
  render() {
    const {list, searchTerm, onDismiss} = this.props;
    
    return (
      <React.Fragment>
        {list.filter(filterSearch(searchTerm)).map( item => 
          <div key={item.objectID}>
            <span><a href={item.url}>{item.title}</a></span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <Button 
              onClick={() => onDismiss(item.objectID)}
            >
              Dismiss
            </Button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

class Button extends Component {
  render() {
    // assign a default value of empty string to className, 
    // so whenever there is no className property specified in the Button component, 
    // the value will be an empty value instead of undefined
    const {onClick, className = '', children} = this.props;
    
    return (
      <button 
        className={className} 
        onClick={onClick} 
        type="button"
      >
        {children}
      </button>
    );
  }
}