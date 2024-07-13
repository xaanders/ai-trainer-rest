import { createClient, User } from "@supabase/supabase-js"
import { Request, Response } from "express"

import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

import * as dotenv from 'dotenv'
dotenv.config();


interface Body {
    access_token: string;
    planId: string;
    userId: string;
    user: User;
}

const schemaGeneratorController = () => {
    const post = async (req: Request<{}, {}, Body>, res: Response) => {

        const TEMPLATE = `
You are a professional fitness expert and trainer. Based on the provided user's profile and workout plan requirements, decide which type of workout is best suited for each day from the following options: Full-Body, Upper-Body, Lower-Body, Push, Pull, Core.

User's Profile:
Gender: {gender}
Age: {age}
Height: {height}
Weight: {weight}
Daily Activity Level: {daily_activity}
Experience: {experience}
Goal: {goal}

Workout Plan Requirements:
Days per week: {days_per_week}

Schemas:
{{ schema_description }}

For each day, select the most appropriate schema based on the user's profile and workout plan requirements. Provide the schema type and detailed exercises for that day.

`

        const supabaseUri: string = process.env.SUPABASE_URL || ""
        const serviceRoleKey: string = process.env.SERVICE_ROLE_KEY || ""

        const supabase = createClient(supabaseUri, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });


        try {
            const user: User = req.body.user;

            const userId = user.id;
            
            const { planId } = req.body
    
            if (!planId)
                return res.status(403).send({ message: "Plan wasn't provided" });

            // find a plan
            const { data: planData, error: planError } = await supabase.from('workout_plans')
                .select(`*,
                    workout_weeks (week_number, week_plan)`)
                .eq('plan_id', planId);

            if (!planData || !planData.length || planError) {
                return res.status(403).send({ message: planError?.message || `Workout plan wasn't found` });
            }

            if (planData.length && !planData[0].is_paid)
                return res.status(403).send({ message: `Workout plan wasn't paid` })


            // check if it is done
            const currentPlan = planData[0]
            if (currentPlan && currentPlan.workout_weeks.length === currentPlan.weeks) {
                return res.status(403).send({ message: "The workout plan has been already finished." });
            }

            // get user profile
            const { data: userData, error: userError } = await supabase.from('profiles').select('*').eq('user_id', userId);
            if ((userData && !userData.length) || userError) {
                return res.status(403).send({ message: userError?.message || `User wasn't found` });
            }

            const profile = userData[0];


            //construct openai request
            const prompt = PromptTemplate.fromTemplate(TEMPLATE);
            /**
             * Function calling is currently only supported with ChatOpenAI models
             */
            const model = new ChatOpenAI({
                temperature: 0.4,
                modelName: "gpt-3.5-turbo-1106",
            });

            const schema = z.object({
                goal: z.string().describe('The workout program goal'),
                workouts: z.array(z.object({
                    day_number: z.number().describe('Workout number'),
                    name: z.string().describe('Workout name'),
                    exercises: z.array(z.string().describe('Exercise presented in the following form: Exercise name - Sets X Reps, Weight in % of 1RM'
                    )).min(6).max(6 + 2).describe('List of exercises for a day'),
                    workout_rules: z.array(z.string().describe('Contains rule of current workout')).describe('List of rules'),
                })).min(currentPlan.days).max(currentPlan.days).describe('List of workouts for a week'),
                tips: z.array(z.string().describe('Contains tip')).describe('List of tips which describe warmup and safety information'),
            })

            const functionCallingModel = model.bind({
                functions: [
                    {
                        name: "output_formatter",
                        description: "Should always be used to properly format output",
                        parameters: zodToJsonSchema(schema),
                    },
                ],
                function_call: { name: "output_formatter" },
            });

            /**
             * Returns a chain with the function calling model.
             */

            const chain = prompt
                .pipe(functionCallingModel)
                .pipe(new JsonOutputFunctionsParser());

            const result = await chain.invoke({
                gender: profile.gender,
                age: profile.age,
                height: profile.height + " " + profile.height_uom,
                weight: profile.weight + " " + profile.weight_uom,
                days_per_week: currentPlan.days,
                experience: currentPlan.fitness_level,
                goal: currentPlan.goal,
                daily_activity: profile.activity
            });

            let newPlan = {
                user_id: profile.user_id,
                plan_id: currentPlan.plan_id,
                week_number: currentPlan.workout_weeks.length + 1,
                week_plan: result
            }

            const { error: weeksError } = await supabase
                .from('workout_weeks')
                .insert(newPlan)

            if (weeksError) {
                console.log(`Error inserting new week: ${weeksError.message}`)
                throw new Error(weeksError.message)
            }
            currentPlan.workout_weeks.push(newPlan)
            delete newPlan.user_id
            delete newPlan.plan_id

            console.log('currentPlan', currentPlan.workout_weeks.length)
            // await addUserActivity('Created a workout week', session.user.id)

            return res.status(200).send(currentPlan);

        } catch (err: any) {
            console.log(err.message)
            return res.status(500).send({ message: err.message });
        }
    }

    return {
        post
    }
}

export default schemaGeneratorController