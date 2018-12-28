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

const PATH_BASE = 'http://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const DEFAULT_QUERY = 'redux';

const filterSearch = searchTerm => 
  item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props) {
    super(props);

    // this.state = {
    //   list: list,
    //   searchTerm: ''
    // };

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  setSearchTopStories(result) {
    this.setState({ result });
  }

  componentDidMount() {
    const {searchTerm} = this.state;

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
    .then( res => res.json()) // the response is transformed to a JSON data structure
    .then( result => this.setSearchTopStories(result) )
    .catch( error => error );
  }

  onDismiss = (id) => {
    const isNotId = item => item.objectID !== id;
    const updatedList = this.state.result.hits.filter( isNotId );
    this.setState({ result: {...this.state.result, hits: updatedList} }); 
    // using spread operator to merge / replace hits (array of objects inside this.state.result object)
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
    const { searchTerm, result } = this.state;
    console.log(result);
    
    // if there is no result (the first time result is null), we prevent from rendering 
    // (It is allowed to return null for a component to display nothing)
    // Once the request to the API has succeeded, 
    // the result is saved to the state and the App component will re-render with the updated state
    // if (!result) { return null }

    return (
      <div className="page">
        <div className="interaction">
          <Search 
            onSearchChange={this.onSearchChange}
            searcTerm={searchTerm}
          >
            Search
          </Search>
        </div>
          { result && 
            <Table 
              list={result.hits} 
              searchTerm={searchTerm}
              onDismiss={this.onDismiss}
            />
          }
      </div>
    );
  }
}

export default App;

const Search = ({onSearchChange, searchTerm, children}) => 
  <form>
    {children}&nbsp;
    <input 
      type="text" 
      onChange={onSearchChange} 
      value={searchTerm}
    />
  </form>

const Table = ({list, searchTerm, onDismiss}) => {
  const largeColumn = { width: '40%' };
  const midColumn = { width: '30%' };
  const smallColumn = { width: '10%' };

  return (
    <div className="table">
      {list.filter(filterSearch(searchTerm)).map( item => 
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}><a href={item.url}>{item.title}</a></span>
          <span style={midColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>
            <Button 
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>
  );
};

// assign a default value of empty string to className, 
// so whenever there is no className property specified in the Button component, 
// the value will be an empty value instead of undefined
const Button = ({onClick, className = '', children}) => 
  <button 
    className={className} 
    onClick={onClick} 
    type="button"
  >
    {children}
  </button>
