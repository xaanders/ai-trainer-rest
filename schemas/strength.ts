import { z } from 'zod';

export const schemaDescription = `
Schemas:
1. Basic: A balanced workout can be used for Upper and Lower body workouts, push-pull-legs workouts, core or full-body, or different split splits.
`;

const basicSchema = z.object({
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

export const strengthSchemas = {
    "Basic": basicSchema,
}