import { Router } from "express";
import { renderView } from "./util";
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { test } from "./testovac";
import { db } from "./db";

const router = Router()

export interface Level {
    song: string
    bpm: number
    firstOffset: number
    tests: Record<string, string>
    id: string
    zadanie: string
    name: string
    order: number
}

const levels: Record<string, Level> = {}
const zadania: Record<string, string> = {}

router.get('/', (req,res) => {
    const firstLevel = Object.keys(levels).sort((a,b)=> levels[a].order - levels[b].order)[0]
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
    req.session.user = await db.getUser(req.session.user.id) || undefined;
    renderView(res, 'editor', {
        user: req.session.user, 
        levels: Object.keys(levels).map((e, i)=> {
            return {
                id: e,
                name: levels[e].name ?? e,
                order: levels[e].order ?? i
            }
        }).sort((a,b) => a.order - b.order),
        zadanie: zadania[req.params.lid],
        data: JSON.stringify(levels[req.params.lid]),
        testOutput: undefined
    });
})

router.post('/:lid/submit', async (req, res) => {
    const user = req.session.user
    if(user == undefined) {
        res.redirect('/')
        return
    }
    const lid = req.params.lid
    if(levels[lid] == undefined) {
        res.sendStatus(400)
        return
    }
    if(user.completedLevels.includes(lid)) {
        res.status(400)
        res.send({
            err: 'level already completed'
        })
        return
    }
    const output = await test(req.body.program, user.name, levels[lid])
    
    if(output.status == 'OK'){
        user.completedLevels.push(lid)
        await db.setUser(user);
    }

    res.send(output)
})

async function loadLevels() {
    const p = path.join(__dirname, 'levels')
    const keys = await readdir(p)
    for (const level of keys) {
        levels[level] = JSON.parse(await readFile(path.join(p, level, 'data.json'), 'utf-8'))
        zadania[level] = await readFile(path.join(p, level, 'index.html'), 'utf-8')
        levels[level].zadanie = zadania[level]
        levels[level].id = level
    }

    console.log(`Loaded ${Object.keys(levels).length} levels`);
    
}

loadLevels()
export default router
