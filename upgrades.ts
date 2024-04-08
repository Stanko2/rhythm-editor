import { Upgrades } from "./db";

export interface upgrade {
    id: number;
    img: string;
    name: string;
    description: string;
    cost: number;
    apply: (data: Upgrades) => Upgrades
    purchased: (data: Upgrades) => boolean
    available?: (data: Upgrades) => boolean
}

const upgrades = <upgrade[]>[
    {
        apply(data) {
            data.tolerance = 2
        }
    },
    {

    }
]

export default 