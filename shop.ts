import { Router } from "express";
import { renderView } from "./util";


const router = Router()

router.get('/', (req, res) => {
    renderView(res, 'shop', {
        user: req.session.user
    })
})

export default router