import { z } from 'zod';

export const schemaDescription = `
Schemas:
1. Basic: A balanced workout that can be used for Upper and Lower body workouts, push-pull-legs workouts, core or full-body, or different split splits.
2. Super Set: A workout structure featuring pairs of exercises performed back-to-back with minimal rest, ideal for enhancing muscular endurance and intensity.
3. Drop Set: A training technique involving exercises performed with progressively lighter weights after reaching muscle failure, effective for increasing muscle hypertrophy.
4. Circuit: A high-intensity workout that includes a series of exercises performed in a sequence with minimal rest, designed to improve cardiovascular fitness and overall strength.
5. Pyramid: A training method that involves increasing or decreasing weights and reps in a structured manner, aimed at building strength and muscle size.
`;

const basicSchema = z.object({
    day_type: z.literal('Basic'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
            .min(6).max(8).describe('List of exercises for a full-body workout'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of full-body workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

const superSetSchema = z.object({
    day_type: z.literal('Super Set'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.object({
            super_set: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
                .min(2).max(2).describe('Pair of exercises for a super set')
        })).min(3).max(4).describe('List of super sets for a workout day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of super set workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

const dropSetSchema = z.object({
    day_type: z.literal('Drop Set'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.object({
            exercise: z.string().describe('Exercise: name'),
            drop_sets: z.array(z.object({
                set_number: z.number().describe('Set number'),
                weight: z.string().describe('Weight in % of 1RM'),
                reps: z.number().describe('Reps per set')
            })).min(3).max(5).describe('Drop sets for the exercise')
        })).min(4).max(6).describe('List of exercises with drop sets for a workout day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of drop set workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});
const circuitTrainingSchema = z.object({
    day_type: z.literal('Circuit'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        circuits: z.array(z.object({
            circuit_number: z.number().describe('Circuit number'),
            exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
                .min(4).max(6).describe('List of exercises for the circuit')
        })).min(2).max(3).describe('List of circuits for a workout day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of circuit training workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});
const pyramidTrainingSchema = z.object({
    day_type: z.literal('Pyramid'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.object({
            exercise: z.string().describe('Exercise: name'),
            pyramid_sets: z.array(z.object({
                set_number: z.number().describe('Set number'),
                weight: z.string().describe('Weight in % of 1RM'),
                reps: z.number().describe('Reps per set')
            })).min(3).max(5).describe('Pyramid sets for the exercise')
        })).min(4).max(6).describe('List of exercises with pyramid sets for a workout day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of pyramid training workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

export const strengthSchemas = {
    "Basic": basicSchema,
    "Super Set": superSetSchema,
    "Drop Set": dropSetSchema,
    "Circuit": circuitTrainingSchema,
    "Pyramid": pyramidTrainingSchema,
};
