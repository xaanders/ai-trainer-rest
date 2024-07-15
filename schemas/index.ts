import { strengthSchemas } from "./strength";
const getSchema = (goal: string) => {
    switch (goal.toLowerCase()) {
        case 'strength':
            return strengthSchemas;
        // case 'cardio':
        //     return cardioSchema;
        // case 'flexibility':
        //     return flexibilitySchema;
        default:
            throw new Error('Unknown goal');
    }
};

export default getSchema