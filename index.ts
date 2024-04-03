import express from 'express'
import { renderView } from './util'
import session from 'express-session'
import loginRouter from './login'
import editorRouter from './editor'
import shopRouter from './shop'

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

declare module 'express-session' {
    interface SessionData {
        user: string
    }
}

app.listen(process.env.PORT ?? 3000,() => {
    console.log('server started');  
})

app.get('/', (req, res) => {
    console.log(req.session.user);
    
    if(req.session.user != undefined) {
        res.redirect('/editor');
    } else {
        renderView(res, 'login', {user: null});
    }
})