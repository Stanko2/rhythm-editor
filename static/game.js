
const root = document.getElementById('game')
const program = document.getElementById('code')
const playBtn = document.getElementById('play')
const stopBtn = document.getElementById('stop')
const submitBtn = document.getElementById('submit')
const levelSelect = document.getElementById('level-select')
const game = document.getElementById('level')
const message = document.getElementById('score-message')
hljs.highlightAll();
// const c = document.getElementById('c')

playBtn.onclick = play
stopBtn.onclick = stop
submitBtn.onclick = submit
let programText = ''

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function mapKeyPressToActualCharacter(isShiftKey, characterCode) {
    if (characterCode === 13){
        return "\n"
    }

    if ( characterCode === 27 || characterCode === 8 || characterCode === 20 || characterCode === 16 || characterCode === 17 || characterCode === 91 || characterCode === 92 || characterCode === 18 ) {
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
    characterMap[186] = ":";
    characterMap[187] = "+";
    characterMap[188] = "<";
    characterMap[189] = "_";
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
            switch (characterCode) {
                case 13:
                    character = '\n'
                    break
                case 9:
                    character = '\t'
                    break
                case 186:
                    character = ';'
                    break
                case 187:
                    character = '='
                    break
                case 188:
                    character = ','
                    break
                case 189:
                    character = '-'
                    break
                case 190:
                    character = '.'
                    break
                case 191:
                    character = '/'
                    break
                case 192:
                    character = '`'
                    break
                case 219:
                    character = '['
                    break
                case 220:
                    character = '\\'
                    break
                case 221:
                    character = ']'
                    break
                case 222:
                    character = '\''
                    break
                default:
                    character = String.fromCharCode(characterCode);
                    break
            }
        }
    }
    return character;
}

function blink() {
    if(upgrades.visualizer <= 0) return
    c.style.opacity = 1
    anime({
        targets: c,
        opacity: 0.5,
        duration: 300,
        easing: 'easeInOutExpo'
    })

    const cursor = document.getElementsByClassName('cursor')[0]
    if(cursor)
        cursor.style.opacity = 1
    anime({
        targets: cursor,
        opacity: 0.5,
        duration: 300,
        easing: 'easeInOutExpo'
    })
}


let playing  = false
let player
let presses = [];
let click = new Audio('/click.mp3')

function play() {
    if(playing) return
    playing = true
    submitBtn.classList.remove('d-none')
    stopBtn.classList.remove('d-none')
    playBtn.classList.add('d-none')
    levelSelect.classList.add('d-none')
    game.classList.remove('col-8')
    player = new Player({
        bpm: levelData.bpm,
        firstOffset: levelData.firstOffset,
        link: levelData.song,
        beats: levelData.beats
    })
    if(upgrades.visualizer >= 2) visualizer()

    player.addEventListener('beat', ()=> {
        click.play()
        blink()
    })
    let lastBeatPressed = -1
    hljs.safeMode(false)
    document.onkeydown = (e) => {
        e.preventDefault()
        const time = audioCtx.currentTime - player.startTime
        const offset = player.getAccuracy(time)
        console.log(offset);
        const s = mapKeyPressToActualCharacter(e.shiftKey, e.keyCode);
        ShowScore(Math.abs(offset))
        if(e.key == 'Backspace'){
            programText = programText.slice(0, -1)
        } else {
            if(s === false || s == undefined) return
            if(GetHitAccuracy(Math.abs(offset)) <= upgrades.tolerance && lastBeatPressed != player.currBeat) {
                if(s === '\t' && !upgrades.useTab)
                    return
                programText += s
                lastBeatPressed = player.currBeat
                splash(e)
            } else {
                if(upgrades.deleteOnMiss) programText = programText.slice(0, -1)
            }
        }

        program.innerHTML = escapeHtml(programText)
        delete program.dataset.highlighted
        hljs.highlightElement(program);
        program.innerHTML += `<i class="cursor"></i>`
        window.scrollTo(0, document.body.scrollHeight);
    }
}

function GetHitAccuracy(offset) {
    // tolerancia
    // 0.5 - vzdy, nezalezi na rytme
    // 0.4 - celkom ok, lahke - asi najvyssi upgrade
    // 0.3 - take priemerne - da sa triafat vzdy
    // 0.2 - da sa triafat tak ~70-80% - asi dobry base value
    // <0.1 - takmer nikdy netrafis
    const tiers = {
        '0.15': {
            tier: 0
        },
        '0.25': {
            tier: 1
        },
        '0.35': {
            tier: 2
        },
        '0.5': {
            tier: 3
        }
    }
    let result
    for (const key of Object.keys(tiers)) {
        if(parseFloat(key) > offset){
            result = tiers[key]
            break
        }
    }
    return result.tier
}

function ShowScore(value) {
    const scores = {
        0: {
            message: 'PERFECT',
            color: 'green'
        },
        1: {
            message: 'AWESOME',
            color: 'blue'
        },
        2: {
            message: 'OK',
            color: 'yellow'
        },
        3: {
            message: 'MISS',
            color: 'red'
        }
    }
    let msg
    msg = scores[GetHitAccuracy(value)]
    message.innerText = msg.message
    message.style.opacity = 1
    message.style.transform = 'scale(1.1)'
    message.style.color = msg.color
    anime({
        targets: message,
        opacity: 0,
        scale: 1,
        duration: 200,
        easing: 'easeInElastic'
    })
}

function stop() {
    delete program.dataset.highlighted
    program.innerText = ""
    playing = false

    submitBtn.classList.add('d-none')
    stopBtn.classList.add('d-none')
    playBtn.classList.remove('d-none')
    levelSelect.classList.remove('d-none')
    game.classList.add('col-8')
    player?.stop()
    player = null
    programText = ''

    document.onkeydown = () => {}
}

async function submit() {
    document.getElementById('submiting').classList.remove('d-none')
    submitBtn.disabled = true
    for (const status of ['OK', 'WA', 'EXC', 'TLE']) {
        document.getElementById(status).classList.add('d-none')
    }

    const res = await fetch(location.href + '/submit', {
        method: 'POST',
        body: JSON.stringify({
            program: programText
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const data = await res.json()
    submitBtn.disabled = false
    document.getElementById('submiting').classList.add('d-none')
    document.getElementById(data.status).classList.remove('d-none')
    if(!upgrades.multiSubmit) stop();
}


function visualizer() {
    const vis = document.getElementById('beats')
    const width = vis.clientWidth
    const beatDivs = []
    const visSeconds = 3
    const tolerance = 0.15
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
            if(pos < 64-beatBarWidth) {
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

    player.addEventListener('beat', ()=>{
        createBeatDiv()
    })
}

let audioCtx = new AudioContext();

class Player extends EventTarget {
    constructor(song) {
        super();
        this.playing = false;
        this.song = song
        this.beats = this.song.beats
        this.firstOffset = song.firstOffset
        this.play()
    }

    findNearestBeat(time) {
        let nearest = this.beats[0];
        let minDiff = Math.abs(time - nearest);

        for (const beat of this.beats) {
            const diff = Math.abs(time - beat);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = beat;
            }
        }
        return nearest;
    }

    getAccuracy(time) {
        const beat = this.findNearestBeat(time)
        const beatTime = 60 / this.song.bpm
        return Math.abs(beat - time) / beatTime - 0.5
    }


    async fetchAll() {
        const songRes = await fetch(this.song.link);
        const data =await songRes.arrayBuffer()
        console.log(data)
        return new Promise((resolve)=>{
            audioCtx.decodeAudioData(data, (buffer)=>{
                console.log("loaded")
                this.sourceNode = audioCtx.createBufferSource()
                this.sourceNode.buffer = buffer
                this.sourceNode.connect(audioCtx.destination)
                this.startTime = audioCtx.currentTime

                this.sourceNode.start(0)
                resolve()
            })
        })
    }

    stop() {
        this.sourceNode.stop()
        clearTimeout(this.beatTimeout)
        this.playing = false;
    }

    async play() {
        await this.fetchAll()
        this.currBeat = 0
        console.log(this.song)
        this.beatTimeout = setTimeout(this.fireBeat.bind(this), this.beats[0] * 1000)

    }

    fireBeat() {
        console.log('beat')
        this.dispatchEvent(new CustomEvent('beat'))
        this.currBeat++;
        if (this.currBeat == this.beats.length)
            return;
        const time = audioCtx.currentTime - this.startTime
        this.beatTimeout = setTimeout(this.fireBeat.bind(this), (this.beats[this.currBeat] - time) * 1000)
    }
}
