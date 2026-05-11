import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export default function VoiceRoom({ documentId }) {
    const { socket } = useSocket();
    const { user } = useAuth();

    const [inCall, setInCall] = useState(false);
    const [callActive, setCallActive] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [speakingUsers, setSpeakingUsers] = useState(new Set());

    const peerRef = useRef(null);
    const streamRef = useRef(null);
    const peersRef = useRef({});
    const audioRefs = useRef({});
    const analyserRef = useRef(null);
    const speakingIntervalRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        // Someone started a call
        socket.on('voice-room-started', (data) => {
            setCallActive(true);
            setParticipants([data.startedBy]);
        });

        // Someone joined the call
        socket.on('voice-user-joined', async (data) => {
            setParticipants(prev => {
                if (prev.find(p => p.userId === data.userId)) return prev;
                return [...prev, { userId: data.userId, name: data.name }];
            });

            // If we're in the call, initiate peer connection
            if (inCall && peerRef.current && data.peerId) {
                const call = peerRef.current.call(data.peerId, streamRef.current);
                if (call) {
                    call.on('stream', (remoteStream) => {
                        playAudio(data.userId, remoteStream);
                    });
                    peersRef.current[data.userId] = call;
                }
            }
        });

        // Someone is speaking
        socket.on('voice-speaking-update', (data) => {
            setSpeakingUsers(prev => {
                const next = new Set(prev);
                if (data.isSpeaking) next.add(data.userId);
                else next.delete(data.userId);
                return next;
            });
        });

        // Someone left the call
        socket.on('voice-user-left', (data) => {
            setParticipants(prev =>
                prev.filter(p => p.userId !== data.userId)
            );
            if (peersRef.current[data.userId]) {
                peersRef.current[data.userId].close();
                delete peersRef.current[data.userId];
            }
            if (audioRefs.current[data.userId]) {
                audioRefs.current[data.userId].srcObject = null;
                delete audioRefs.current[data.userId];
            }
        });

        // Call ended by host
        socket.on('voice-room-ended', () => {
            setCallActive(false);
            setInCall(false);
            setParticipants([]);
            cleanup();
        });

        return () => {
            socket.off('voice-room-started');
            socket.off('voice-user-joined');
            socket.off('voice-speaking-update');
            socket.off('voice-user-left');
            socket.off('voice-room-ended');
        };
    }, [socket, inCall]);

    function playAudio(userId, stream) {
        let audio = audioRefs.current[userId];
        if (!audio) {
            audio = new Audio();
            audio.autoplay = true;
            audioRefs.current[userId] = audio;
        }
        audio.srcObject = stream;
    }

    async function startCall() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            streamRef.current = stream;

            // Dynamic import PeerJS
            const peer = new Peer({
                host: import.meta.env.VITE_PEER_HOST || 'localhost',
                port: import.meta.env.VITE_PEER_PORT || 5000,
                path: '/peerjs',
                secure: import.meta.env.PROD || false
            });

            peer.on('open', (peerId) => {
                peerRef.current = peer;
                setInCall(true);
                setCallActive(true);
                setParticipants([{
                    userId: user.id,
                    name: user.name
                }]);

                socket.emit('voice-start', documentId);
                socket.emit('voice-join', { documentId, peerId });
            });

            // Handle incoming calls
            peer.on('call', (call) => {
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    playAudio(call.peer, remoteStream);
                });
            });

            // Setup speaking detection
            setupSpeakingDetection(stream);

        } catch (err) {
            console.error('Failed to start call:', err);
            alert('Could not access microphone. Please allow microphone access.');
        }
    }

    function setupSpeakingDetection(stream) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let wasSpeaking = false;

        speakingIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const isSpeaking = avg > 10;

            if (isSpeaking !== wasSpeaking) {
                wasSpeaking = isSpeaking;
                socket.emit('voice-speaking', {
                    documentId,
                    isSpeaking
                });
            }
        }, 200);
    }

    async function joinCall() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            streamRef.current = stream;

            const { Peer } = await import('peerjs');
            const peer = new Peer({
                host: import.meta.env.VITE_PEER_HOST || 'localhost',
                port: import.meta.env.VITE_PEER_PORT || 5000,
                path: '/peerjs',
                secure: import.meta.env.PROD || false
            });

            peer.on('open', (peerId) => {
                peerRef.current = peer;
                setInCall(true);
                socket.emit('voice-join', { documentId, peerId });
            });

            peer.on('call', (call) => {
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    playAudio(call.peer, remoteStream);
                });
            });

            setupSpeakingDetection(stream);
        } catch (err) {
            console.error('Failed to join call:', err);
        }
    }

    function toggleMute() {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    }

    function leaveCall() {
        socket.emit('voice-leave', documentId);
        setInCall(false);
        cleanup();

        // If no one else, end the call
        if (participants.length <= 1) {
            socket.emit('voice-end', documentId);
            setCallActive(false);
            setParticipants([]);
        }
    }

    function cleanup() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        if (speakingIntervalRef.current) {
            clearInterval(speakingIntervalRef.current);
        }
        Object.values(peersRef.current).forEach(call => call.close());
        peersRef.current = {};
        setSpeakingUsers(new Set());
    }

    // Not in call, no active call
    if (!callActive && !inCall) {
        return (
            <button
                onClick={startCall}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-slate-800 hover:bg-slate-700 border border-slate-700
                           text-slate-300 hover:text-white text-xs transition-all"
                title="Start voice call"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Call
            </button>
        );
    }

    // Call active but user not in it
    if (callActive && !inCall) {
        return (
            <button
                onClick={joinCall}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-green-600 hover:bg-green-700
                           text-white text-xs transition-all animate-pulse"
                title="Join active call"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Join Call ({participants.length})
            </button>
        );
    }

    // User is in the call
    return (
        <div className="flex items-center gap-2">
            {/* Participants */}
            <div className="flex items-center gap-1">
                {participants.map(p => (
                    <div
                        key={p.userId}
                        title={p.name}
                        className={`w-6 h-6 rounded-full bg-primary-600
                                    flex items-center justify-center
                                    text-white text-xs font-medium
                                    transition-all
                                    ${speakingUsers.has(p.userId)
                                ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-slate-900'
                                : ''
                            }`}
                    >
                        {p.name?.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>

            {/* Mute button */}
            <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg text-xs transition-all ${isMuted
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>

            {/* Leave button */}
            <button
                onClick={leaveCall}
                className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-700
                           text-white text-xs transition-all"
                title="Leave call"
            >
                Leave
            </button>
        </div>
    );
}