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
        description: 'Budeš vedieť písať aj pri "OK"',
        cost: 1000,
        id: 1,
        purchased(data) {
            return data.tolerance >= 3
        },
        available(data) {
            return data.tolerance >= 2
        },
        apply(data) {
            data.tolerance = 3
            return data
        },
    },
    {
        name: 'Tolerancia III.',
        description: 'Budeš vedieť písať vždy, stále však iba jeden kláves za beat.',
        id: 2,
        cost: 10000,
        purchased(data) {
            return data.tolerance >= 4
        },
        available(data) {
            return data.tolerance >= 3
        },
        apply(data) {
            data.tolerance = 4
            return data
        }
    }, 
    {
        name: 'Vizuálne efekty',
        description: 'Pozadie bude blikať do rytmu, čiže budeš vidieť, kedy stlačiť kláves',
        id: 4,
        purchased(data) {
            return false;
        }
    },
    {
        name: 'Indikátor úspešných stlačení',
        description: 'budeš lepšie vidieť kedy sa ti napísal znak a kedy nie',
        id: 5,
        purchased(data) {
            return false;
        }
    },
    {
        name: 'Visualizér',
        description: 'Lepšie uvidíš, presne kedy treba stlačiť kláves',
        id: 6,
        purchased(data) {
            return false;
        }
    },
    {
        name: 'Zrušenie penalizácie',
        description: 'Zruší penalizáciu za stlačenie mimo rytmu, teda sa už nebudú mazať písmenká pri ťukaní mimo rytmu',
        id: 7,
        purchased(data) {
            return false;
        }
    },
    {
        name: 'Cinkanie',
        description: 'Budeš počuť kedy treba ťukať',
        id: 8,
        purchased(data) {
            return false;
        }
    },
    {
        name: 'Slúchadlá',
        description: 'Máš povolenie si zobrať vlastné slúchadlá',
        id: 9,
        purchased(data) {
            return false;
        }
    },
    {
        name: 'Tab',
        description: 'Môžeš používať Tab namiesto 4 medzier',
        id: 10,
        purchased(data) {
            return false;
        }
    }, 
    {
        name: 'Loop',
        description: 'Po skončení začne pesnička znova, teda netreba stihnúť napísať kód za jednu iteráciu pesničky',
        id: 11,
        purchased(data) {
            return false;
        }
    },
]

export default upgrades