import { Router } from "express";
import { db } from "./db";

const router = Router({});


router.post('/', async (req,res)=> {
    const user = await db.login(req.body.meno, req.body.heslo);
    if (user) {
        req.session.user = user
        res.redirect(req.session.user.admin ? '/coins/admin' : '/editor');
    } else {
        res.redirect('/')
    }
    
})

export default router