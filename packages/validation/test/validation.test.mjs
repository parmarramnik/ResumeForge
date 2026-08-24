import assert from 'node:assert/strict';
import {
  personalInfoSchema,
  educationItemSchema,
  experienceItemSchema,
  projectItemSchema,
  resumeFormDataSchema,
  compileRequestSchema,
} from '../src/index.ts';

console.log('Running validation schema unit tests...');

// 1. Personal info validation
const validPersonal = {
  name: 'Alex Mercer',
  email: 'alex@example.com',
  phone: '+1 555-0199',
  location: 'San Francisco, CA',
};
const parsedPersonal = personalInfoSchema.safeParse(validPersonal);
assert.equal(parsedPersonal.success, true);

const invalidPersonal = { name: '', email: 'not-an-email' };
const parsedInvalidPersonal = personalInfoSchema.safeParse(invalidPersonal);
assert.equal(parsedInvalidPersonal.success, false);

// 2. Experience validation
const validExp = {
  company: 'Apex Cloud Systems',
  role: 'Staff Engineer',
  start_date: 'Jan 2022',
  end_date: 'Present',
  bullets: ['Optimized throughput by 40%', 'Mentored 5 engineers'],
};
const parsedExp = experienceItemSchema.safeParse(validExp);
assert.equal(parsedExp.success, true);

// 3. Compile Request size limits
const validCompileReq = {
  tex: '\\documentclass{article}\\begin{document}Hello World\\end{document}',
  engine: 'tectonic',
};
const parsedCompile = compileRequestSchema.safeParse(validCompileReq);
assert.equal(parsedCompile.success, true);

const oversizedCompileReq = {
  tex: 'x'.repeat(2500000), // > 2MB
};
const parsedOversized = compileRequestSchema.safeParse(oversizedCompileReq);
assert.equal(parsedOversized.success, false);

console.log('All validation schema tests passed successfully!');
