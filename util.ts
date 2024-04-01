import { Response } from 'express'

export function renderView(res: Response, view: string, ctx: any) {
    res.render('main', {
        view,
        ...ctx
    })
}