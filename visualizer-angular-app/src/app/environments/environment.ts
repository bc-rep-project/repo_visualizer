import * as dotenv from 'dotenv';

dotenv.config();

export const environment = {
  production: false,
  githubPat: process.env['GITHUB_PAT'],
};