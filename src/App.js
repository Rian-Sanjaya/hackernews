import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { sortBy } from 'lodash'; // use sortBy function from lodash
import classnames from 'classnames';

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

// define sort functions where each takes a list and returns a list of items sorted by a specific property. 
// Additionally, you will need a default sort function that doesn’t sort, but returns the unsorted list. This will be the initial state.
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
}

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

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE', // The initial state will be the default sort function, which doesn’t sort at all 
      isSortReverse: false // define the reverse state. The sort can be either reversed or non-reversed.
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    // evaluate if the list is reverse sorted. It is reverse if the sortKey in
    // the state is the same as the incoming sortKey and the reverse state is not already set to true
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse

    this.setState({
      sortKey,
      isSortReverse
    });
  } 

  render() {
    const { list, onDismiss } = this.props
    const { sortKey, isSortReverse } = this.state;

    const largeColumn = { width: '40%' };
    const midColumn = { width: '30%' };
    const smallColumn = { width: '10%' };
  
    // takes one of the SORTS functions by sortKey and passes the list as input
    const sortedList = SORTS[sortKey](list); // return an array
    // console.log(sortedList);
    const reverseSortedList = isSortReverse 
      ? sortedList.reverse() 
      : sortedList 
    // console.log(reverseSortedList);

    return (
      <div className="table">
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort 
              sortKey={'TITLE'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Title
            </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort 
              sortKey={'AUTHOR'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Author
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort 
              sortKey={'COMMENTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Comments
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort 
              sortKey={'POINTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Points
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            Archive
          </span>
        </div>
        {reverseSortedList.map( item => 
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
  }
}

const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  // const sortClass = ['button-inline'];

  // if (sortKey === activeSortKey) {
  //   sortClass.push('button-active');
  // }

  // using classnames package library
  const sortClass = classnames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  )

  return (
    <Button
      onClick={ () => onSort(sortKey) }
      // className={ sortClass.join(' ') }
      className={sortClass}
    >
      {children}
    </Button>
  );
}

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
