import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';
function* sendAudio(action){
   
    try{
 
    // console.log(action.payload)
      const response = yield axios.get(`googleCloud/transcription`, {
          params: {
        file: '/Users/newowner/Desktop/2minSamplecopy.wav',

          }}
)
    console.log(response.data)
    
     yield put({type: 'GET_TRANSCRIPT', payload: response.data })
    }
    catch (err) {
       
    
}}

function* getTranscript(action){
    try{
    const response = yield axios.get(`googleCloud/transcript`, {
        params: {
      fileName: action.payload.fileName,
      bucketName: action.payload.bucketName

        }}
)
console.log(response)
}

catch (err){}
}
function* googleSaga() {
    yield takeLatest('SEND_AUDIO', sendAudio);
    yield takeLatest('GET_TRANSCRIPT', getTranscript);
}
export default googleSaga