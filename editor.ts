import { Router } from "express";
import { renderView } from "./util";
import { readdir, readFile } from 'fs/promises'
import path from 'path'

const router = Router()

interface Level {
    song: string
    bpm: number
    firstOffset: number
}

const levels: Record<string, Level> = {}
const zadania: Record<string, string> = {}

router.get('/', (req,res) => {
    const firstLevel = Object.keys(levels)[0]
    res.redirect('/editor/' + firstLevel)
})

router.get('/:lid', async (req, res) => {
    if(req.session.user == undefined) {
        res.redirect('/')
        return
    }
    const lid = req.params.lid
    if(levels[lid] == undefined) {
        res.sendStatus(404)
        return
    }
    
    renderView(res, 'editor', {
        user: req.session.user, 
        levels: Object.keys(levels),
        zadanie: zadania[req.params.lid],
        data: JSON.stringify(levels[req.params.lid])
    });
})

async function loadLevels() {
    const p = path.join(__dirname, 'levels')
    const keys = await readdir(p)
    for (const level of keys) {
        if(!level.endsWith('.html')) continue
        const name = level.split('.')[0]
        levels[name] = JSON.parse(await readFile(path.join(p, name+ '.json'), 'utf8'))        
        zadania[name] = await readFile(path.join(p, level), 'utf8')
    }

    console.log(`Loaded ${Object.keys(levels).length} levels`);
    
}

loadLevels()
export default router
