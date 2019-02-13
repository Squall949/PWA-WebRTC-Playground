import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {saveStream} from './utility';

class App extends Component {
  peerConnection;
  serverConnection;
  viewerConn;
  localVideo = React.createRef();
  remoteVideo = React.createRef();

  constructor() {
    super();
    this.state = {isStartDisabled: false, isViewDisabled: false, isHangUpDisabled: true, localStream: undefined};
  }

  componentDidMount() {
    this.initWebsocketConn(true);
    
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then(this.handleSuccess)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
  }

  handleSuccess = (stream) => {
    // when user is offline, recording the stream
    if (!window.navigator.onLine)
      saveStream(stream);

    this.setState({localStream: stream});
    this.localVideo.current.srcObject = stream;
  }

  initWebsocketConn = (isCaller) => {
    if (isCaller) {
      this.serverConnection = new WebSocket('ws://localhost:8000/object/caller/send');
      this.viewerConn = new WebSocket('ws://localhost:8000/object/callee/viewer');
    }
    else {
      this.serverConnection = new WebSocket('ws://localhost:8000/object/callee/send');
      this.viewerConn = new WebSocket('ws://localhost:8000/object/caller/viewer');
    }

    this.viewerConn.onmessage = this.gotMessageFromServer;
  }

  initPeerConnection = () => {
    const peerConnectionConfig = {
      'iceServers': [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'},
      ]
    };
    this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
    this.peerConnection.addEventListener('icecandidate', this.handleConnection);
    this.peerConnection.addEventListener('track', this.gotRemoteStream);
    this.peerConnection.addStream(this.state.localStream);

    console.log('init peerConn');
  }

  handleConnection = (event) => {
    const iceCandidate = event.candidate;
  
    if (iceCandidate) {
      this.serverConnection.send(JSON.stringify({'ice': iceCandidate}));
      console.log('send iceCandidate');
    }
  }

  // start to connect
  handleStartClick = () => {
    this.initPeerConnection();
    this.controlBtnStates();

    const offerOptions = {
      offerToReceiveVideo: 1
    };

    this.peerConnection.createOffer(offerOptions).then(this.createDescription).catch(this.errorHandler);
  }

  createDescription = (description) => {
    this.peerConnection.setLocalDescription(description).then(() => {
      this.serverConnection.send(JSON.stringify({'sdp': this.peerConnection.localDescription}));
      console.log('send description');
    }).catch(this.errorHandler);
  }

  errorHandler = (error) => {
    console.log(error.toString());
  }

  gotMessageFromServer = (message) => {
    const signal = JSON.parse(message.data);
  
    if(signal.sdp) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        // Only create answers in response to offers
        if(signal.sdp.type === 'offer') {
          this.peerConnection.createAnswer().then(this.createDescription).catch(this.errorHandler);
          console.log('create answer');
        }
      }).catch(this.errorHandler);
    } 
    else if(signal.ice) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(this.errorHandler);
      console.log('add iceCandidate');
    }
    else {
      this.dismiss();
    }
  }

  gotRemoteStream = (event) => {
    console.log(event);
    this.remoteVideo.current.srcObject = event.streams[0];
  }

  handleStopClick = () => {
    this.dismiss();

    this.serverConnection.send(JSON.stringify({'dismiss': ''}));
  }

  // handleRadioChange = (event) => {
  //   console.log(event.currentTarget.value);
  //   this.initWebsocketConn((event.currentTarget.value === 'caller') ? true : false);
  // }

  handleViewClick = () => {
    this.initWebsocketConn(false);
    this.initPeerConnection();
    this.controlBtnStates();
  }

  controlBtnStates = () => {
    this.setState({isStartDisabled: true});
    this.setState({isViewDisabled: true});
    this.setState({isHangUpDisabled: false});
  }

  dismiss = () => {
    this.peerConnection.close();
    this.peerConnection = undefined;

    this.setState({isStartDisabled: false});
    this.setState({isViewDisabled: false});
    this.setState({isHangUpDisabled: true});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Welcome to PWAWebRTC</h1>
        </header>
        {/* <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p> */}
        <div className="App-videos">
          <video id="localVideo" autoPlay playsInline ref={this.localVideo}></video>
          <video id="remoteVideo" autoPlay playsInline ref={this.remoteVideo}></video>
        </div>

        {/* <div>
          <input type="radio" id="caller" name="role" value="caller" onChange={this.handleRadioChange}></input><label htmlFor="caller">caller</label>
          <input type="radio" id="viewer" name="role" value="viewer" onChange={this.handleRadioChange}></input><label htmlFor="viewer">viewer</label>
        </div> */}

        <div className="App-action-btns">
          <button id="startButton" className="actionButton" onClick={this.handleStartClick} disabled={this.state.isStartDisabled}>Start</button>
          <button id="viewButton" className="actionButton" onClick={this.handleViewClick} disabled={this.state.isViewDisabled}>View</button>
          <button id="hangupButton" className="actionButton" onClick={this.handleStopClick} disabled={this.state.isHangUpDisabled}>Hang Up</button>
        </div>
      </div>
    );
  }
}

export default App;
