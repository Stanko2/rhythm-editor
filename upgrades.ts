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
        name: 'Základná tolerancia',
        description: 'Budeš vedieť písať aj pri "AWESOME"',
        id: 0,
        cost: 100,
        purchased(data) {
            return data.tolerance >= 1
        },
        apply(data) {
            data.tolerance = 1
            return data
        }
    },
    {
        name: 'Silná tolerancia',
        description: 'Budeš vedieť písať aj pri "OK"',
        cost: 1000,
        id: 1,
        purchased(data) {
            return data.tolerance >= 2
        },
        available(data) {
            return data.tolerance >= 1
        },
        apply(data) {
            data.tolerance = 2
            return data
        },
    },
    {
        name: 'Zrušenie penalizácie',
        description: 'Zruší penalizáciu za stlačenie mimo rytmu, teda sa už nebudú mazať písmenká pri ťukaní mimo rytmu',
        id: 2,
        cost: 10000,
        purchased(data) {
            return !data.deleteOnMiss;
        },
        available(data) {
            return data.tolerance >= 2
        },
        apply(data) {
            data.deleteOnMiss = false
            return data
        }
    },
    {
        name: 'Ultimátna tolerancia',
        description: 'Budeš vedieť písať vždy, stále však iba jeden kláves za beat.',
        id: 3,
        cost: 10000,
        purchased(data) {
            return data.tolerance >= 3
        },
        available(data) {
            return !data.deleteOnMiss;
        },
        apply(data) {
            data.tolerance = 3
            return data
        }
    }, 
    {
        name: 'Tab',
        description: 'Môžeš používať Tab namiesto 4 medzier',
        id: 4,
        cost: 2000,
        purchased(data) {
            return data.useTab;
        },
        available(data) {
            return data.tolerance >= 1
        },
        apply(data) {
            data.useTab = true
            return data
        }
    }, 
    {
        name: 'Vizuálne efekty',
        description: 'Pozadie bude blikať do rytmu, čiže budeš vidieť, kedy stlačiť kláves',
        id: 11,
        cost: 1000,
        purchased(data) {
            return data.visualizer >= 1;
        },
        apply(data) {
            data.visualizer = 1
            return data
        }
    },
    {
        name: 'Visualizér',
        description: 'Lepšie uvidíš, presne kedy treba stlačiť kláves',
        id: 12,
        cost: 1000,
        purchased(data) {
            return data.visualizer >= 2;
        },
        available(data) {
            return data.visualizer >= 1
        },
        apply(data) {
            data.visualizer = 2
            return data
        }
    },
    {
        name: 'Indikátor úspešných stlačení',
        description: 'budeš lepšie vidieť kedy sa ti napísal znak a kedy nie',
        id: 13,
        cost: 1000,
        purchased(data) {
            return data.successFeedback;
        },
        available(data) {
            return data.visualizer >= 1
        },
        apply(data) {
            data.successFeedback = true
            return data
        }
    },/*
    {
        name: 'Cinkanie',
        description: 'Budeš počuť kedy treba ťukať',
        id: 8,
        purchased(data) {
            return false;
        }
    },*/
    {
        name: 'Slúchadlá',
        description: 'Máš povolenie si zobrať vlastné slúchadlá',
        id: 21,
        cost: 1000,
        purchased(data) {
            return data.headphones;
        },
        apply(data) {
            data.headphones = true
            return data
        }
    },
    {
        name: 'Loop',
        description: 'Po skončení začne pesnička znova, teda netreba stihnúť napísať kód za jednu iteráciu pesničky',
        id: 22,
        cost: 2500,
        purchased(data) {
            return data.looping;
        },
        available(data) {
            return data.headphones
        },
        apply(data) {
            data.looping = true
            return data
        }
    },
    {
        name: 'Multi submit',
        description: 'Po submite sa ti kód nezmaže, a v prípade nesprávneho submitu môžeš v programovaní pokračovať',
        id: 23,
        cost: 2500,
        purchased(data) {
            return data.multiSubmit;
        },
        available(data) {
            return data.looping
        },
        apply(data) {
            data.multiSubmit = true
            return data
        }
    },
]

export default upgrades