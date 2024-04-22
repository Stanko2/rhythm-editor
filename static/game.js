
const root = document.getElementById('game')
const program = document.getElementById('code')
const playBtn = document.getElementById('play')
const stopBtn = document.getElementById('stop')
const submitBtn = document.getElementById('submit')
// const c = document.getElementById('c')

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
    c.style.opacity = 1
    c.style.transition = 'none'
    setTimeout(() => {
        c.style.transition = 'all 200ms ease-out'
        c.style.opacity = 0.5
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
    visualizer()

    player.addEventListener('beat', ()=> {
        (new Audio('/click.mp3')).play()
        blink()
    })
    let lastBeatPressed = -1
    document.onkeydown = (e) => {
        // (new Audio('/click.mp3')).play()
        const pos = player.getPositionInBeats()
        const currBeat = Math.round(pos)
        
        const offset = pos - currBeat
        console.log(offset);
        const s = mapKeyPressToActualCharacter(e.shiftKey, e.keyCode);
        if(e.key == 'Backspace'){
            program.innerText = program.innerText.slice(0, -1)
        } else {
            if(s === false || s == undefined) return
            if(Math.abs(offset) < 0.5 && lastBeatPressed != currBeat) { // tolerancia
                // 0.5 - vzdy, nezalezi na rytme
                // 0.4 - celkom ok, lahke - asi najvyssi upgrade
                // 0.3 - take priemerne - da sa triafat vzdy
                // 0.2 - da sa triafat tak ~70-80% - asi dobry base value
                // <0.1 - takmer nikdy netrafis
                program.innerText += s
                lastBeatPressed = currBeat
            } else {
                program.innerText = program.innerText.slice(0, -1)
            }
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

async function submit() {
    console.log(program.innerText);
    
    const res = await fetch(location.href + '/submit', {
        method: 'POST',
        body: JSON.stringify({
            program: program.innerText
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const data = await res.json()

    document.getElementById(data.status).classList.toggle('d-none')

    stop();
}


function visualizer() {
    const vis = document.getElementById('beats')
    const width = vis.clientWidth
    const beatDivs = []
    const visSeconds = 3
    const tolerance = 0.2
    const bps = player.song.bpm / 60
    const beatLength = (width / visSeconds) / bps
    const beatBarWidth = beatLength * (tolerance * 2)

    function createBeatDiv() {
        const div = document.createElement('div')
        div.classList.add('beat')
        const beatsInAdvance = Math.ceil(visSeconds * (player.song.bpm / 60))
        const appearWidth = beatsInAdvance * beatLength - (beatBarWidth/2) + 64
        div.style.left = appearWidth + 'px'
        div.style.width = beatBarWidth + 'px'
        beatDivs.push(div)
        vis.appendChild(div)
    }

    requestAnimationFrame(render)
    let lastTime = 0
    function render(time) {
        const dt = time - lastTime
        for (let i = 0; i < beatDivs.length; i++) {
            const div = beatDivs[i]
            const pos = parseInt(div.style.left.slice(0,-2))
            if(pos < 0) {
                beatDivs.splice(i, 1)
                div.remove()
                continue
            }
            const move = (dt / 1000) * width / visSeconds
            div.style.left = (pos - move) + 'px'
        }

        lastTime = time
        if(playing)
            requestAnimationFrame(render)
        else 
            vis.replaceChildren();
    }

    player.addEventListener('beat', createBeatDiv)
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