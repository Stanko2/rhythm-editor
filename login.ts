import { Router } from "express";

const router = Router({});


router.post('/', async (req,res)=> {
    if (req.body.meno == 'test' && req.body.heslo == 'test'){
        // await new Promise<void>(resolve => req.session.regenerate(() => resolve))
        req.session.user = req.body.meno
        res.redirect('/editor')
        // req.session.save(() => {
        //     console.log(req.session.user);
        // })
    } else {
        res.redirect('/')
    }
    
})

export default router