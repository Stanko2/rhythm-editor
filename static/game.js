
const root = document.getElementById('game')
const program = document.getElementById('code')
const playBtn = document.getElementById('play')
const stopBtn = document.getElementById('stop')
const submitBtn = document.getElementById('submit')

playBtn.onclick = play
stopBtn.onclick = stop
submitBtn.onclick = submit

function blink() {
    root.style.background = 'black'
    root.style.transition = 'none'
    setTimeout(() => {
        root.style.transition = 'all 100ms ease-out'
        root.style.background = 'white'
    }, 80);
}
let playing  = false
let player
function play() {
    if(playing) return
    playing = true
    submitBtn.classList.toggle('d-none')
    stopBtn.classList.toggle('d-none')
    playBtn.classList.toggle('d-none')
    player = new Player({
        bpm: levelData.bpm,
        firstOffset: levelData.firstOffset,
        link: levelData.song
    })
    player.addEventListener('beat', ()=> {
        blink()
    })

    document.onkeydown = (e) => {
        const pos = player.getPositionInBeats()
        const offset = pos - Math.round(pos)
        console.log(offset, pos);
        const s = String.fromCharCode(e.keyCode)
        if(Math.abs(offset) < 0.3) {
            if(e.shiftKey)
                program.innerText += s
            else 
                program.innerText += s.toLowerCase()
            console.log(String.fromCharCode(e.keyCode));
        } else {
            program.innerText = program.innerText.slice(0, -1)
        }
        delete program.dataset.highlighted
        hljs.highlightAll();
    }
}

function stop() {
    delete program.dataset.highlighted
    program.innerText = ""
    playing = false

    submitBtn.classList.toggle('d-none')
    stopBtn.classList.toggle('d-none')
    playBtn.classList.toggle('d-none')
    player?.stop()
    player = null

    document.onkeydown = () => {}   
}

function submit() {
    console.log(program.innerText);

    stop();
}

class Player extends EventTarget {
    getPositionInBeats() {
        const songStart = this.start + this.song.firstOffset * 1000
        const currentPosition = (performance.now() - songStart) / 1000
        return currentPosition / (60 / this.song.bpm)
    }

    constructor(song) {
        super();
        this.song = song
        this.start = performance.now()
        this.firstOffset = song.firstOffset
        this.audio = new Audio(song.link)
        this.play()
    }

    stop() {
        this.audio.pause()
        this.audio.currentTime = 0
        if(this.beatInterval)
            clearInterval(this.beatInterval)
    }

    play() {
        this.audio.play()
        setTimeout(() => {
            this.beatInterval = setInterval(()=> {
                this.dispatchEvent(new CustomEvent('beat'))
            }, 60 / this.song.bpm * 1000)
        }, this.song.firstOffset)
    }
}