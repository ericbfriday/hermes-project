import React, { Component } from 'react';
import { connect } from 'react-redux';
import EditPodBeanForm from './EditPodBeanForm';
import EditWordPressForm from './EditWordPressForm';
import StepperBar from '../StepperBar/StepperBar';
import swal from 'sweetalert';
// import Grid from '@material-ui/core/Grid';
import './EditPage.css';
import Grid from '@material-ui/core/Grid';


class EditPage extends Component {
    componentDidMount = () => {
        this.props.dispatch({ type: "STEP_THREE" })
    }
    //need to conditionally send it either to the transcript page
    //or to the review page
    handleClick = (event) => {
        event.preventDefault();
        console.log('Next button clicked on edit page');
        this.props.history.push('/review-page');
    }

    //use the same function as the other pages for this button
    handleCancelButton = () => {
        console.log('in SweetAlert Cancel Button');
        swal({
            title: "Are you sure?",
            text: "Careful, you will lose all progress and information forever!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    swal("Poof! Your imaginary file has been deleted!", {
                        icon: "success",
                    });
                    this.props.history.push('/connect');
                } else {
                    swal("Your imaginary file is safe!");
                }
            });
    }

    render() {
        return (
            <>
                <div>
                <StepperBar activeStep='3'></StepperBar>
                    <h2>Edit Page</h2>

                </div>
                <Grid
                    container
                    alignItems="center"
                    direction="column"
                    // justify="space-evenly"
                >
                    <Grid item >
                        <Grid
                            container
                            direction="column"
                        >
                            <Grid item>
                                <EditPodBeanForm />
                            </Grid>
                            <Grid item>
                                <EditWordPressForm />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item >
                        <Grid 
                            container
                            alignItems="center"
                            direction="row"
                        >
                            <Grid item>
                                <button className="myButton" onClick={this.handleCancelButton}>Cancel</button>
                            </Grid>
                            <Grid item>
                                <button className="myButton" onClick={this.handleClick}>Next</button>
                            </Grid>
                        </Grid>
                        
                        
                    </Grid>
                    
                </Grid>
            </>
        )
    }
}

const mapReduxStateToProps = reduxState => ({
    reduxState
});

export default connect(mapReduxStateToProps)(EditPage);