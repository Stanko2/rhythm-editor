import { Upgrades } from "./db";

export interface upgrade {
    id: number;
    img: string;
    name: string;
    description: string;
    cost: number;
    /**
     * Kúpil som upgrade, čo sa má stať?
     * @param data 
     * @returns referencia na nové dáta
     */
    apply: (data: Upgrades) => Upgrades
    /**
     * Je tento upgrade kúpený?
     * @param data 
     * @returns 
     */
    purchased: (data: Upgrades) => boolean
    /**
     * Je tento upgrade dostupný na kúpenie?
     * @param data 
     * @returns 
     */
    available?: (data: Upgrades) => boolean
}

const upgrades = <upgrade[]>[
    {
        name: 'Tolerancia I.',
        description: 'Budeš vedieť písať aj pri "AWESOME"',
        id: 0,
        cost: 100,
        purchased(data) {
            return data.tolerance >= 2
        },
        apply(data) {
            data.tolerance = 2
            return data
        }
    },
    {
        name: 'Tolerancia II.',
        description: 'Budeš vedieť písať aj pri "AWESOME"',
        cost: 1000000,
        id: 1,
        purchased(data) {
            return false
        }
    },
    {
        name: 'Tolerancia III.',
        description: 'Budeš vedieť písať aj pri "AWESOME"',
        id: 2,
        purchased(data) {
            return true
        }
    }, 
    {
        name: 'Tolerancia IV.',
        description: 'Budeš vedieť písať aj pri "AWESOME"',
        id: 3,
        available(data) {
            return false
        },
        purchased(data) {
            return false
        }
    }
]

export default upgrades