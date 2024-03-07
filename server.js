import express from "express";
const app = express();
const port = process.env.PORT || 8080;
import dotenv from 'dotenv'
import cors from 'cors'

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

import { createClient } from '@supabase/supabase-js'

const env = dotenv.config().parsed

app.use(cors());
app.use(express.json())
const TEMPLATE = `Act as a professional fitness expert and trainer. Create structured of an exercise plan specifically tailored for me. 
i am a {gender}, {age} years old, {height} tall and {weight}. I want to work out {days_per_week} and have {experience} experience in the gym. My goal is {goal}. 
Do not include rest days, every day must contain exercises.
With split type of program. My daily activity level is {daily_activity} `;

const supabase = createClient(env.SUPABASE_URL, env.SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

app.post('/api/workout-generate', async (req, res) => {
    const access_token = req.body?.access_token

    if (!access_token)
        return res.send('No access token found')

    const { error, data } = await supabase.auth.getUser(access_token)

    if (error || !data) {
        console.log(`Not authenticated attempt to generate a workout. ${'error: ' + error?.message}`)
        return res.status(401).send({ message: error.message })
    }

    try {
        const { id: userId } = data.user;
        const { planId } = req.body

        if (!planId)
            return res.status(403).send({ message: "Plan id doesn't exist" });
        // find a plan
        const { data: planData, error: planError } = await supabase.from('workout_plans')
            .select(`*,
         workout_weeks (week_number, week_plan)`)
            .eq('plan_id', planId);

        if (!planData?.length || planError || !planData[0].is_paid) {
            return res.status(403).send({ message: planError?.message || `Workout plan wasn't found` });
        }


        // check if it is done
        const currentPlan = planData[0]
        if (currentPlan && currentPlan.workout_weeks.length === currentPlan.weeks) {
            return res.status(403).send({ message: "The workout plan has been already done." });
        }


        // get user profile
        const { data: userData, error: userError } = await supabase.from('profiles').select('*').eq('user_id', userId || currentPlan.user_id);

        if (!userData?.length || userError) {
            return res.status(403).send({ message: userError?.message || `User wasn't found` });
        }

        const profile = userData[0];


        //construct openai request
        const prompt = PromptTemplate.fromTemplate(TEMPLATE);
        /**
         * Function calling is currently only supported with ChatOpenAI models
         */
        const model = new ChatOpenAI({
            temperature: 0.5,
            modelName: "gpt-3.5-turbo-1106",
        });

        // const schema = z.object({
        //   goal: z.string().describe('The workout program goal'),
        //   workouts: z.array(z.object({
        //     day_number: z.number().describe('Workout number'),
        //     name: z.string().describe('Workout name'),
        //     exercises: z.array(z.object({
        //       exercise_1: z.string().describe('Exercise presented in the following form: Exercise name - Reps, Weight in % of 1RM'),
        //       exercise_2: z.string().describe('Exercise presented in the following form: Exercise name - Reps, Weight in % of 1RM'),
        //       sets_number: z.number().describe('Number of sets for super set')
        //     }).describe('Super sets of exercises')).min(6).max(6 + 2).describe('List of exercises for a day')
        //   })).min(+currentPlan.days).max(+currentPlan.days).describe('List of workouts for a week'),
        //   tips: z.array(z.string().describe('Contains tip')).describe('List of tips which describe warmup and safety information')
        // })
        console.log('currentPlan----------------', currentPlan)
        // basic strength schema

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

    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ message: err.message });
    }
    // res.send({error, data})
})


app.listen(port, () => {
    console.log(`Started server on port ${port}`);
});