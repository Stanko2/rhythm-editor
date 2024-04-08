import { Router } from "express";
import { db } from "./db";
import { renderView } from "./util";

const router = Router()

router.get('/admin', (req, res)=> {
    if(!req.session.user?.admin)
        res.send(403)

    res.render('coinAdmin', {
        user: req.session.user,
        coinCode: null
    })
})

router.post('/create', async (req, res) => {
    if(!req.session.user?.admin)
        res.send(403)

    const coupon = await db.createCoupon(parseInt(req.body.coins))
    res.render('coinAdmin', {
        user: req.session.user,
        coinCode: coupon.code
    })
})

router.post('/redeem', async (req, res) => {
    const user = req.session.user;

    if(user == undefined){
        res.send(400)
        return
    }

    console.log('code:' + req.body.code);
    

    await db.redeem(req.body.code, user.id).catch(err=> {
        res.status(400)
        res.send({success: false, err})
    }).then((user)=>{
        console.log(user);
        
        if(user){
            req.session.user!.coins = user.coins
            res.send({success: true, coins: user.coins})
        } else {
            res.sendStatus(400)
        }
    })
})

export default router