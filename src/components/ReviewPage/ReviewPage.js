import React, { Component } from 'react';
import { connect } from 'react-redux';
import StepperBar from '../StepperBar/StepperBar';
import swal from 'sweetalert';
// import podbean from '../../../public/images/logo/podbean.png';
import './ReviewPage.css';


//this page will need to send the post requests to the selected platforms

//this is just the bare bones layout

class ReviewPage extends Component {
    componentDidMount = () => {
        this.props.dispatch({ type: "STEP_FOUR" })
    }
    handleClick = (event) => {
        event.preventDefault();
        console.log('button clicked');
        this.props.history.push('/publish-page');
    }

    handleClickEdit = (event) => {
        event.preventDefault();
        console.log('return to edit page button clicked');
        this.props.history.push('/edit-page');
    }

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
                    this.props.history.push('/platforms');
                } else {
                    swal("Your imaginary file is safe!");
                }
            });
    }

    render() {
        return (
       
                <div>
                    <StepperBar activeStep='4'></StepperBar>

                    <div className="box">
                        <h1 className="header">Review sites to be published to</h1>
                        <br />
                        <img className="podbean" src='images/logo/podbean.png'/>
                        <p>WordPress</p>
                        <button onClick={this.handleClickEdit}>Edit</button>

                    <div className="grid-container">
                        <div className="review-box grid-item">
                            <div className="review grid-item">
                                <h1>Review sites to be published to</h1>
                            </div>
                            <br />

                            <div className="icons grid-item">
                                <p className="podbean">PodBean</p>
                                <p className="wordpress">WordPress</p>
                            </div>
                            <div className="edit grid-item">
                            <button onClick={this.handleClickEdit}>Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <button className="cancelButton" onClick={this.handleCancelButton}>Cancel</button>
                    <button className="publishButton" onClick={this.handleClick}>Publish</button>
                </div>
         </div>
            
        )}
}

const mapReduxStateToProps = reduxState => ({
    reduxState
});

export default connect(mapReduxStateToProps)(ReviewPage);