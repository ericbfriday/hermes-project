import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App/App.css';
// import LogOutButton from '../LogOutButton/LogOutButton';
import './ConnectPage.css';
import Grid from '@material-ui/core/Grid';

class ConnectPage extends Component {

    handleStartPostButton = (event) => {
        console.log('handleStartPostButton hit');
        // direct to next step: Select Platform
        event.preventDefault();
        this.props.history.push('/platforms');
        this.props.dispatch({ type: "STEP_ONE" })
    }
    componentDidMount() {
        this.props.dispatch({ type: 'CHECK_TOKEN' })

    }

    render() {
        return (
            <>
                <Grid
                    container
                    alignItems="left"
                    direction="center"
                    spacing={24}
                    
                >
                    <Grid item sm={12}>
                        <Grid 
                            container
                            alignItems="center"
                            direction="column"
                            spacing={24}
                        >
                            <Grid item sm={12}
                                onClick={this.handleWordPressClick} 
                                
                            >
                                <a href='https://public-api.wordpress.com/oauth2/authorize?client_id=65413&response_type=code&redirect_uri=http://localhost:5000/wordpress/callback_wordpress'>
                                <div className="connect-div">
                                    <div className="connect-to">
                                        CONNECT TO
                                    </div>
                                    
                                        <div className="image-div">
                                            <img className="icons" src="images/logo/WordPress.png" alt="wordpress_link" />
                                        </div>
                                </div>
                                </a>
                            </Grid>

                            <Grid item sm={12}
                                onClick={this.handlePodBeanClick} 
                            >
                                <div className="connect-div" >
                                    <div className="connect-to">
                                        CONNECT TO
                                    </div>
                                        <a href='https://api.podbean.com/v1/dialog/oauth?redirect_uri=https://hermes-host.herokuapp.com/podbean/callback_podbean&scope=episode_publish&response_type=code&client_id=7ae314124aac5c7de467d'>
                                        <div className="image-div">  
                                                <img className="icons" src="images/logo/podbean.png" alt="podbean_link" />
                                            </div>
                                        </a>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item sm={12}>
                        <Grid 
                            container
                            alignItems="center"
                            direction="column"
                            spacing={24}
                        >
                            <Grid item sm={12}>
                                <button className="myButton" onClick={this.handleStartPostButton}>START POSTING</button>
                            </Grid>
                        </Grid>

                        
                    </Grid>
        
                </Grid>
                
            </>
        );
    };
};

const mapReduxStateToProps = reduxState => ({
    reduxState
});

export default connect(mapReduxStateToProps)(ConnectPage);
