import fs from 'fs/promises'
import { spawn } from 'child_process'
import path from 'path';
import { Level } from './editor';

const TIME_LIMIT = 5000

export async function test(submit: string, user: string, level: Level): Promise<TestOutput> {
    if(submit.match('import') != null){
        return {
            status: 'EXC'
        }
    }
    const levelPath = path.join(__dirname, 'levels', level.id)
    const programPath = path.join(levelPath, 'submits', user + '.py')
    fs.writeFile(programPath, submit);

    let out: TestOutput
    const vstupy = path.join(levelPath, 'vstupy')
    for (const test of Object.keys(level.tests)) {
        out = await testInput(programPath, path.join(vstupy, test), path.join(vstupy, level.tests[test]))
        if(out.status != 'OK'){
            return out
        }
    }

    return out!
}

interface TestOutput {
    status: 'WA' | 'OK' | 'TLE' | 'EXC'
}

async function testInput(program: string, input: string, output: string): Promise<TestOutput> {
    return new Promise(async (resolve, reject)=> {
        var isWin = process.platform === "win32";
        const p = spawn(isWin ? 'python' : 'python3', [ program ])
        p.on('error', reject)
        p.stdin.write(await fs.readFile(input))
        let out = ''
        p.stdout.on('data', (chunk)=> {
            out += chunk
        })
        p.stderr.on('data', ()=> {
            clearTimeout(timeout)
            p.kill('SIGKILL')
            resolve({
                status: 'EXC'
            })
        })
        const expectedOutput = await fs.readFile(output, 'utf-8')
        p.on('exit', () => {
            clearTimeout(timeout)
            if(out != expectedOutput) {
                resolve({
                    status: 'WA'
                })
            }
            return resolve({
                status: 'OK'
            })
        })

        const timeout = setTimeout(() => {
            p.kill('SIGKILL')
            resolve({
                status: 'TLE'
            })
        }, TIME_LIMIT);
    })
}
