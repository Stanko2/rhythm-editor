import { RedisClientType, createClient } from 'redis'
import { readFileSync } from 'fs'

export interface User {
    name: string;
    password: string;
    coins: number;
    upgrades: Upgrades;
    id: number;
    admin: boolean;
    completedLevels: string[];
}

export interface Upgrades {
    tolerance: 0 | 1 | 2 | 3
    visualizer: 0 | 1 | 2
    deleteOnMiss: boolean
}

export interface Coupon {
    code: string
    coins: number
}

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

export class Database {
    client: RedisClientType
    constructor() {
        this.client = createClient()
        this.client.connect().then(()=> {
            console.log('connected to database');
        })
    }

    async getUser(id: number): Promise<User | null> {
        const data = await this.client.get('users:'+id)
        if(!data)
            return null
        return JSON.parse(data)
    }

    async login(name: string, password: string): Promise<User | null> {
        const users = await this.client.keys('users:*')
        console.log(users);
        
        for (const key of users) {
            const userStr = await this.client.get(key)
            const user = JSON.parse(userStr!) as User
            if(user.name == name && user.password == password)
                return user
        }

        return null;
    }

    async setUser(user: User): Promise<void> {
        await this.client.set('users:'+user.id, JSON.stringify(user))
    }

    async createCoupon(coins: number): Promise<Coupon> {
        const code = makeid(7)
        const coupon = <Coupon>{
            code,
            coins
        }
        await this.client.set('coupons:'+code, JSON.stringify(coupon))
        return coupon
    }
    
    async redeem(code: number, userId: number) {
        const couponStr = await this.client.get('coupons:'+code);
        if(!couponStr)
            throw new Error('Invalid code')
        const coupon = JSON.parse(couponStr) as Coupon
        console.log(coupon);
        
        const user = await this.getUser(userId);
        if (!user)
            throw new Error('Invalid user')

        console.log(user);
        
        user.coins += coupon.coins
        this.client.set('users:'+userId, JSON.stringify(user))
        this.client.del('coupons:'+code)
        return user
    }
}

export const db = new Database()

async function importUsers() {
    await db.client.del('users:*')
    const data = JSON.parse(readFileSync('users.json', 'utf-8')) as User[]
    for (let i = 0; i < data.length; i++) {
        const user = data[i];
        user.id = i;
        await db.client.set('users:'+i, JSON.stringify(user));
    }
    console.log('imported ' + data.length + ' users');
}



if(process.argv[2] == 'loadUsers') {
    importUsers().then(()=> {
        process.exit(0)
    })
}

