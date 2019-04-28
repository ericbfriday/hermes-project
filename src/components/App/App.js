import React, {Component} from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import {connect} from 'react-redux';

import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute'
import AboutPage from '../AboutPage/AboutPage';
import UserPage from '../UserPage/UserPage';
import InfoPage from '../InfoPage/InfoPage';
import ConnectPage from '../ConnectPage/ConnectPage';
import PlatformsPage from '../PlatformsPage/PlatformsPage';
import UploadPage from '../UploadPage/upload';
import EditPage from '../EditPage/EditPage';
import TranscriptPage from '../TranscriptPage/TranscriptPage';
import ReviewPage from '../ReviewPage/ReviewPage';
import PublishPage from '../PublishPage/PublishPage';
import './App.css';
//material UI installs
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { createMuiTheme } from '@material-ui/core/styles';

//importing Mui Theme so that the project is wrapped in our chosen color swatches and access fonts throughout app
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#006487', // off white
      main: '#CA9E1C', // gold
      dark: '#002A38', // dark blue
      contrastText: '#EBEFF0', // blue
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: '18',
    useNextVariants: true,
  },
});




class App extends Component {
  componentDidMount () {
    this.props.dispatch({type: 'FETCH_USER'})
  }

  render() {

    return (

      <MuiThemeProvider theme={theme}>
      <Router>
        <div>
          <Nav />
          <Switch>
            {/* Visiting localhost:3000 will redirect to localhost:3000/home */}
            <Redirect exact from="/" to="/home" />
            {/* Visiting localhost:3000/about will show the about page.
            This is a route anyone can see, no login necessary */}
            <Route
              exact
              path="/about"
              component={AboutPage}
            />
            {/* For protected routes, the view could show one of several things on the same route.
            Visiting localhost:3000/home will show the UserPage if the user is logged in.
            If the user is not logged in, the ProtectedRoute will show the 'Login' or 'Register' page.
            Even though it seems like they are different pages, the user is always on localhost:3000/home */}
            <ProtectedRoute
              exact
              path="/home"
              component={ConnectPage}
            />
            {/* This works the same as the other protected route, except that if the user is logged in,
            they will see the info page instead. */}
            <ProtectedRoute
              exact
              path="/info"
              component={ConnectPage}
            />
            <ProtectedRoute
              exact
              path="/test"
              component={InfoPage}
            />
            <ProtectedRoute
              exact
              path="/connect"
              component={ConnectPage}
            />
            <ProtectedRoute
              exact
              path="/platforms"
              component={PlatformsPage}
            />
            <ProtectedRoute
              exact
              path="/upload"
              component={UploadPage}
            />
            <ProtectedRoute
              exact
              path="/transcript-page"
              component={TranscriptPage}
            />
            <ProtectedRoute
              exact
              path="/edit-page"
              component={EditPage}
            />
            <ProtectedRoute
              exact
              path="/review-page"
              component={ReviewPage}
            />
            <ProtectedRoute
            exact
              path="/publish-page"
              component={PublishPage}
              />

            {/* If none of the other routes matched, we will show a 404. */}
            <Route render={() => <h1>404</h1>} />
          </Switch>
          <Footer />
        </div>
      </Router>
      </MuiThemeProvider>
  )}
}

export default connect()(App);