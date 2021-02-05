    var dotnetHelper = null;

    function SetDotnetHelper(helper) {
        dotnetHelper = helper;
    }


    const peerConnections = {};
    const config = {
        "iceServers":
            [
                { "urls": "stun:74.125.142.127:19302" },
                { "urls": "turn:turn.anyfirewall.com:443?transport=tcp", "username": "webrtc", "credential": "webrtc" }
            ]
    };

    var audio = new Audio();
    var video;
    var localStream;

    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        if (!video) {
            video = document.getElementById("remote-video");
        }

        localStream = stream;
        audio.onloadedmetadata = function (ev) {

            // Play the audio in the 2nd audio 
            // element what is being recorded 
            console.log("PLAYT");
            audio.play();
        };
    })



    function CreateRTCConnection(id) {
        const peerConnection = new RTCPeerConnection(config);

        peerConnection.oniceconnectionstatechange = event => {
            console.log("connection changed");
            console.log(peerConnection);
        }

        peerConnections[id] = peerConnection;

        let stream = localStream;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log("Sending candidate");
                dotnetHelper.invokeMethodAsync("SendCandidateAsync", id, JSON.stringify(event.candidate));
            }
        }

        peerConnection.ontrack = event => {
            console.log("GOT TRACK");
            console.log(event.streams);
            video.srcObject = event.streams[0];
            audio.srcObject = event.streams[0];
            console.log(peerConnection.connectionState);
        };

        peerConnection
            .createOffer()
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                console.log("Sending offer");
                dotnetHelper.invokeMethodAsync("SendOfferAsync", id, JSON.stringify(peerConnection.localDescription));
            });

    }

    function addCandidate(id, candidate) {
        console.log("ADDING CANDIDATE");
        peerConnections[id].addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
    }

    function setRemoteDescription(id, description) {
        console.log("GOT ANSWER");
        peerConnections[id].setRemoteDescription(JSON.parse(description));
    }

    function onOffer(id, description) {
        const peerConnection = new RTCPeerConnection(config);

        peerConnection.oniceconnectionstatechange = event => {
            console.log("connection changed");
            console.log(peerConnection);
        }

        let stream = localStream;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection
            .setRemoteDescription(JSON.parse(description))
            .then(() => peerConnection.createAnswer())
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                console.log("Sending answer");
                dotnetHelper.invokeMethodAsync("SendAnswerAsync", id, JSON.stringify(peerConnection.localDescription));
            });


        peerConnection.ontrack = event => {
            console.log("GOT TRACK");
            console.log(event.streams);
            audio.srcObject = event.streams[0];
            video.srcObject = event.streams[0];
            console.log(peerConnection.connectionState);
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log("Sending candidate");
                dotnetHelper.invokeMethodAsync("SendCandidateAsync", id, JSON.stringify(event.candidate));
            }
        }

    }
