const clientId = 'f250b3f0ce604150b056707b8e25a328'
const redirectUri = 'http://localhost:3000'
const scopes = [
    'streaming',
    'user-read-birthdate',
    'user-read-private',
    'user-modify-playback-state'
]
let _token
let player
let playerData

window.onSpotifyPlayerAPIReady = () => {
    console.log("player API is ready")
    createPlayerForSong("3n3Ppam7vgaVa1iaRUc9Lp")
}

function createPlayerForSong(track) {
    fetch('/token', {
        method: 'GET'
    }).then(response => {
            return response.json().then(response => {
                console.log(response.token)
                _token = response.token
                player = new Spotify.Player({
                    name: 'Web Playback SDK Template',
                    getOAuthToken: cb => {
                        cb(_token)
                    }
                })
                // Error handling
                player.on('initialization_error', e => console.error(e))
                player.on('authentication_error', e => console.error(e))
                player.on('account_error', e => console.error(e))
                player.on('playback_error', e => console.error(e))

                // Playback status updates
                player.on('player_state_changed', state => {
                    console.log("state is: ")
                    console.log(state)
                    if (state != null) {
                        $('#current-track').attr('src', state.track_window.current_track.album.images[0].url)
                        $('#current-track-name').text(state.track_window.current_track.name)
                        //edit this to incclude the whole atrists array?
                        $('#current-track-artist').text(state.track_window.current_track.artists[0].name)
                    }

                })

                // Ready
                player.on('ready', data => {
                    console.log('Ready with Device ID', data.device_id)
                    playerData = data
                    // Play a track using our new device ID
                    getAudio(data.device_id)
                })

                // Connect to the player!
                player.connect()

                // Play a specified track on the Web Playback SDK's device ID
                function getAudio(device_id) {
                    $.ajax({
                        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
                        type: "PUT",
                        data: '{"uris": ["spotify:track:' + track + '"]}',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + _token)
                        },
                        success: function (data) {
                            console.log(data)
                        }
                    })
                }
            })
        }
    )
}

let interval

function turningRecord(turn) {
    let counter = 0
    if (turn) {
        interval = setInterval(function () {
            console.log("interval")
            counter -= 1
            $("#current-track").css({
                MozTransform: 'rotate(-' + -counter + 'deg)',
                WebkitTransform: 'rotate(' + -counter + 'deg)',
                transform: 'rotate(' + -counter + 'deg)'
            })

        }, 10)
    } else {
        clearInterval(interval)

    }
}

let currentlyPlaying = true
turningRecord(currentlyPlaying)

function togglePlayPause() {
    currentlyPlaying = !currentlyPlaying
    console.log("currentlyplaying is " + currentlyPlaying)
    turningRecord(currentlyPlaying)
    player.togglePlay()
    let playPauseButton = document.getElementById("play-pause-button");
    let imageSrc = playPauseButton.getAttribute('src')
    if(imageSrc === "images/play.png")
    {
        playPauseButton.setAttribute('src', "images/pause.png");
    } else if (imageSrc === "images/pause.png") {
        playPauseButton.setAttribute('src', "images/play.png");
    }
}

function playSomeTrackID(track) {

    if(currentlyPlaying) {
        let playPauseButton = document.getElementById("play-pause-button");
        playPauseButton.setAttribute('src', "images/pause.png");
    }

    player.disconnect()
    console.log("player disconnected")
    console.log("trying to play " + track)
    createPlayerForSong(track)
    if (!currentlyPlaying) {
        currentlyPlaying = true
        turningRecord(currentlyPlaying)
    }
}