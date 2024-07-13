import { z } from 'zod';

export const schemaDescription = `
Schemas:
1. Full-Body: A balanced workout covering all major muscle groups.
2. Upper-Body: Focuses on exercises that target the upper body muscles.
3. Lower-Body: Concentrates on exercises that target the lower body muscles.
4. Push: Emphasizes pushing exercises such as chest, shoulders, and triceps.
5. Pull: Emphasizes pulling exercises such as back and biceps.
6. Core: Focuses on exercises that strengthen the core muscles.
`;

const fullBodyStrengthSchema = z.object({
    day_type: z.literal('Full-Body'),
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

const upperBodyStrengthSchema = z.object({
    day_type: z.literal('Upper-Body'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
            .min(6).max(8).describe('List of exercises for an upper-body workout'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of upper-body workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

const lowerBodyStrengthSchema = z.object({
    day_type: z.literal('Lower-Body'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
            .min(6).max(8).describe('List of exercises for a lower-body workout'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of lower-body workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

// Add three more schemas with similar structures for variety
const pushStrengthSchema = z.object({
    day_type: z.literal('Push'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
            .min(6).max(8).describe('List of push exercises for the day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of push workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

const pullStrengthSchema = z.object({
    day_type: z.literal('Pull'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
            .min(6).max(8).describe('List of pull exercises for the day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of pull workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

const coreStrengthSchema = z.object({
    day_type: z.literal('Core'),
    goal: z.string().describe('The workout program goal'),
    workouts: z.array(z.object({
        day_number: z.number().describe('Workout day number'),
        name: z.string().describe('Workout name'),
        exercises: z.array(z.string().describe('Exercise: name - Sets X Reps, Weight in % of 1RM'))
            .min(6).max(8).describe('List of core exercises for the day'),
        workout_rules: z.array(z.string().describe('Rules for the current workout')).describe('List of rules')
    })).describe('List of core workouts'),
    tips: z.array(z.string().describe('Tips about warmup and safety information')).describe('List of tips')
});

export const strengthSchemas = {
    "Full-Body": fullBodyStrengthSchema,
    "Upper-Body": upperBodyStrengthSchema,
    "Lower-Body": lowerBodyStrengthSchema,
    "Push": pushStrengthSchema,
    "Pull": pullStrengthSchema,
    "Core": coreStrengthSchema
}