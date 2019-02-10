import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {saveStream} from './utility';

class App extends Component {
  peerConnection;
  serverConnection;

  constructor() {
    super();
    this.state = {isStartDisabled: false, isCallDisabled: true, isHangUpDisabled: true, localStream: undefined};
  }

  componentDidMount() {
    this.serverConnection = new WebSocket(`ws://${window.location.hostname}:8000`);
    this.serverConnection.onmessage = this.gotMessageFromServer;

    navigator.mediaDevices.getUserMedia({
      audio: true,
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
    this.localVideo.srcObject = stream;
  }

  initPeerConnection = () =>{
    const peerConnectionConfig = {'iceServers': [{urls: `stun:${window.location.hostname}:8000`}]};
    this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
    this.peerConnection.addEventListener('icecandidate', this.handleConnection);
    this.peerConnection.addEventListener('track', this.gotRemoteStream);
    this.peerConnection.addStream(this.state.localStream);
  }

  handleConnection = (event) => {
    const iceCandidate = event.candidate;
  
    if (iceCandidate) {
      this.serverConnection.send(JSON.stringify({'ice': iceCandidate}));
    }
  }

  handleStartClick = () => {
    this.setState({isStartDisabled: true});
    this.setState({isHangUpDisabled: false});

    this.initPeerConnection();

    const offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };

    this.peerConnection.createOffer(offerOptions).then(this.createDescription).catch(this.errorHandler);
  }

  createDescription = (description) => {
    this.peerConnection.setLocalDescription(description).then(() => {
      this.serverConnection.send(JSON.stringify({'sdp': this.peerConnection.localDescription}));
    }).catch(this.errorHandler);
  }

  errorHandler(error) {
    console.log(error.toString());
  }

  gotMessageFromServer(message) {
    if(!this.peerConnection) this.initPeerConnection();
  
    const signal = JSON.parse(message.data);
  
    if(signal.sdp) {
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        // Only create answers in response to offers
        if(signal.sdp.type === 'offer') {
          this.peerConnection.createAnswer().then(this.createDescription).catch(this.errorHandler);

        }
      }).catch(this.errorHandler);
    } 
    else if(signal.ice) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(this.errorHandler);
      this.setState({isStartDisabled: true});
      this.setState({isHangUpDisabled: false});
    }
    else {
      this.dismiss();
    }
  }

  gotRemoteStream(event) {
    this.remoteVideo.srcObject = event.streams[0];
  }

  handleStopClick = () => {
    this.dismiss();

    this.serverConnection.send(JSON.stringify({'dismiss': ''}));
  }

  dismiss = () => {
    this.peerConnection.close();
    this.peerConnection = undefined;

    this.setState({localStream: undefined});
    this.setState({isStartDisabled: false});
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
          <video id="localVideo" autoPlay playsInline ref={video => {this.localVideo = video}}></video>
          <video id="remoteVideo" autoPlay playsInline ref={video => {this.remoteVideo = video}}></video>
        </div>

        <div className="App-action-btns">
          <button id="startButton" className="actionButton" onClick={this.handleStartClick} disabled={this.state.isStartDisabled}>Start</button>
          <button id="hangupButton" className="actionButton" onClick={this.handleStopClick} disabled={this.state.isHangUpDisabled}>Hang Up</button>
        </div>
      </div>
    );
  }
}

export default App;
