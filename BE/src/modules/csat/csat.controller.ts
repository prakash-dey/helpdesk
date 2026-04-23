import { Request, Response } from 'express';
import { z } from 'zod';
import * as csatService from './csat.service';

export async function getSurvey(req: Request, res: Response): Promise<void> {
  const survey = await csatService.getSurvey(req.params.surveyId);
  res.json({ data: survey });
}

export async function submitSurvey(req: Request, res: Response): Promise<void> {
  const { score, comment } = z.object({
    score: z.number().min(1).max(5),
    comment: z.string().optional(),
  }).parse(req.body);
  const survey = await csatService.submitSurvey(req.params.surveyId, score, comment);
  res.json({ data: survey });
}

export async function listSurveys(req: Request, res: Response): Promise<void> {
  const surveys = await csatService.listSurveys(req.params.orgId);
  res.json({ data: surveys });
}
