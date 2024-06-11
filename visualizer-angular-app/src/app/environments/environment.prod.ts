import * as dotenv from 'dotenv';

dotenv.config();

export const environment = {
  production: true,
  githubPat: process.env['GITHUB_PAT'],
};