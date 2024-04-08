import express from 'express'
import { renderView } from './util'
import session from 'express-session'
import loginRouter from './login'
import editorRouter from './editor'
import shopRouter from './shop'
import coinRouter from './coins'
import { User } from './db'

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('static'))
app.use(express.json())
app.use(express.urlencoded())

app.use(session({
    secret: 'secret editor',
    unset: 'destroy',
    saveUninitialized: true,
    resave: true
}))

app.use('/login', loginRouter)
app.use('/editor', editorRouter)
app.use('/shop', shopRouter)
app.use('/coins', coinRouter)

declare module 'express-session' {
    interface SessionData {
        user: User
    }
}

app.listen(process.env.PORT ?? 3000,() => {
    console.log('server started');  
})

app.get('/', (req, res) => {
    if(req.session.user != undefined) {
        res.redirect(req.session.user.admin ? '/admin' : '/editor');
    } else {
        renderView(res, 'login', {user: null});
    }
})