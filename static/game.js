
const root = document.getElementById('game')
const program = document.getElementById('code')
const playBtn = document.getElementById('play')
const stopBtn = document.getElementById('stop')
const submitBtn = document.getElementById('submit')

playBtn.onclick = play
stopBtn.onclick = stop
submitBtn.onclick = submit


function mapKeyPressToActualCharacter(isShiftKey, characterCode) {
    if (characterCode === 13){
        return "\n"
    }

    if ( characterCode === 27 || characterCode === 8 || characterCode === 9 || characterCode === 20 || characterCode === 16 || characterCode === 17 || characterCode === 91 || characterCode === 92 || characterCode === 18 ) {
        return false;
    }
    if (typeof isShiftKey != "boolean" || typeof characterCode != "number") {
        return false;
    }
    var characterMap = [];
    characterMap[192] = "~";
    characterMap[49] = "!";
    characterMap[50] = "@";
    characterMap[51] = "#";
    characterMap[52] = "$";
    characterMap[53] = "%";
    characterMap[54] = "^";
    characterMap[55] = "&";
    characterMap[56] = "*";
    characterMap[57] = "(";
    characterMap[48] = ")";
    characterMap[109] = "_";
    characterMap[107] = "+";
    characterMap[219] = "{";
    characterMap[221] = "}";
    characterMap[220] = "|";
    characterMap[59] = ":";
    characterMap[222] = "\"";
    characterMap[188] = "<";
    characterMap[190] = ">";
    characterMap[191] = "?";
    characterMap[32] = " ";

    var character = "";
    if (isShiftKey) {
        if ( characterCode >= 65 && characterCode <= 90 ) {
            character = String.fromCharCode(characterCode);
        } else {
            character = characterMap[characterCode];
        }
    } else {
        if ( characterCode >= 65 && characterCode <= 90 ) {
            character = String.fromCharCode(characterCode).toLowerCase();
        } else {
            character = String.fromCharCode(characterCode);
        }
    }
    return character;
}

function blink() {
    root.style.background = 'black'
    root.style.transition = 'none'
    setTimeout(() => {
        root.style.transition = 'all 200ms ease-out'
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
    let lastBeatPressed = -1
    document.onkeydown = (e) => {
        const pos = player.getPositionInBeats()
        const currBeat = Math.round(pos)

        if(lastBeatPressed == currBeat) return
        const offset = pos - currBeat
        console.log(offset);
        const s = mapKeyPressToActualCharacter(e.shiftKey, e.keyCode);
        if(s === false || s == undefined) return
        if(Math.abs(offset) < 0.2) { // tolerancia
            // 0.5 - vzdy, nezalezi na rytme
            // 0.4 - celkom ok, lahke - asi najvyssi upgrade
            // 0.3 - take priemerne - da sa triafat vzdy
            // 0.2 - da sa triafat tak ~70-80% - asi dobry base value
            // <0.1 - takmer nikdy netrafis
            program.innerText += s
        } else {
            program.innerText = program.innerText.slice(0, -1)
        }
        delete program.dataset.highlighted
        hljs.highlightAll();
        lastBeatPressed = currBeat
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
        // const songStart = this.start + this.song.firstOffset * 1000
        const currentPosition = this.audio.currentTime
        return currentPosition / (60 / this.song.bpm) - 0.5
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