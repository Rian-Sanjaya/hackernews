import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

// const list = [
//   {
//     title: 'React',
//     url: 'https://reactjs.org/',
//     author: 'Jordan Walke',
//     num_comments: 3,
//     points: 4,
//     objectID: 0,
//   }, 
//   {
//     title: 'Redux',
//     url: 'https://redux.js.org/',
//     author: 'Dan Abramov, Andrew Clark',
//     num_comments: 2,
//     points: 5,
//     objectID: 1,
//   }, 
// ];

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '20';

const PATH_BASE = 'http://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

class App extends Component {
  _isMounted = false;   // We don’t load anything before the App component is mounted

  constructor(props) {
    super(props);

    // results: {
      // react: {
      //   hits: [{...}, {...}, {...}],
      //   page: 2
      // },
      // redux: {
      //   hits: [{...}, {...}, {...}],
      //   page: 1
      // }
    // }

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  setSearchTopStories(result) { 
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    // We want to concatenate the old and new list of hits from the local state and new result object, 
    // so we’ll adjust its functionality to add new data rather than override it.

    const oldHits = results && results[searchKey] 
      ? results[searchKey].hits 
      : []

    // merge the old hits with the new hits
    const updatedHits = [
      ...oldHits, 
      ...hits
    ];

    // the searchKey is the search term. 
    // [searchKey]: ... syntax. It is an ES6 computed property name. It helps you allocate values dynamically in an object.
    // the ...results needs to spread all other results by searchKey in the state using the object spread operator. 
    // Otherwise, you would lose all results that you have stored before.
    this.setState({ 
      results: {
        ...results, 
        [searchKey]: { hits: updatedHits, page: page } 
      },
      isLoading: false
    });
  }

  // we are implimenting a client cache
  // if the search key is already exists in the local state results key, no need to fetch
  // if not we fetch the data from API
  needsToSearchTopStories = (searchTerm) => !this.state.results[searchTerm];

  fetchSearchTopStories = (searchTerm, page = 0) => {
    // we’ll show a loading indicator when a search request submits to the Hacker News API
    this.setState({ isLoading: true });

    // fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    // .then( res => res.json() ) // the response is transformed to a JSON data structure
    // .then( result => this.setSearchTopStories(result) )
    // .catch( error => this.setState({ error }) );

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then( result => this._isMounted && this.setSearchTopStories(result.data) )
    .catch( error => this._isMounted &&  this.setState({ error }));
  };

  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss = (id) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedList = hits.filter( isNotId );
    this.setState({ 
      results: {
        ...results, 
        [searchKey]: { hits: updatedList, page }
      } 
    }); 
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

  onSearchSubmit = (event) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    // we are implimenting a client cache
    // if the search key is already exists in the local state results key, no need to fetch
    // if not we fetch the data from API
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    
    event.preventDefault(); // prevent native browser behavior (browser will reload for a submit callback in an HTML form)
  }

  render() {
    const { searchTerm, results, searchKey, error, isLoading } = this.state;
    console.log(results);
    
    // if there is no result (the first time result is null), we prevent from rendering 
    // (It is allowed to return null for a component to display nothing)
    // Once the request to the API has succeeded, 
    // the result is saved to the state and the App component will re-render with the updated state
    // if (!result) { return null }

    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interaction">
          <Search 
            onSearchChange={this.onSearchChange}
            searcTerm={searchTerm}
            onSearchSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <React.Fragment>
          {error 
            ? <div className="interactions">
                <p>Something went wrong when fecthing data.</p>
              </div>
            : <Table 
                list={list} 
                onDismiss={this.onDismiss}
              />
          }
          {/* we’ll show a loading indicator when a search request submits to the Hacker News AP */}
          { list.length > 0 &&
            <div className="interactions">
              <ButtonWithLoading
                isLoading={isLoading}
                onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
              >
                More
              </ButtonWithLoading>
            </div>
          }
        </React.Fragment>
      </div>
    );
  }
}

// const Search = ({onSearchChange, searchTerm, onSearchSubmit, children}) => 
//   <form onSubmit={onSearchSubmit}>
//     {children}&nbsp;
//     <input 
//       type="text" 
//       onChange={onSearchChange} 
//       value={searchTerm}
//     />
//     <button type="submit">
//       {children}
//     </button>
//   </form>

class Search extends Component {
  // set focus to search input field when the component render the first time
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { onSearchChange, searchTerm, onSearchSubmit, children } = this.props;

    return (
      <form onSubmit={onSearchSubmit}>
        {children}&nbsp;
        <input 
          type="text"
          onChange={onSearchChange}
          value={searchTerm}
          ref={el => this.input = el}
        />
        <button type="submit">
          {children}
        </button>
      </form>
    );
  }
}

const Table = ({list, onDismiss}) => {
  const largeColumn = { width: '40%' };
  const midColumn = { width: '30%' };
  const smallColumn = { width: '10%' };

  return (
    <div className="table">
      {list.map( item => 
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

const Loading = () => <div>Loading...</div>

// using higher order component for conditional  rendering
const withLoading = (Component) => ({ isLoading, ...rest }) => 
  isLoading 
  ? <Loading />
  : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

export default App;
export { Search, Table, Button };
