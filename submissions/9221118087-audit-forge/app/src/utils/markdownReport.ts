import type { AuditReport, AuditReportInput } from '../types/audit';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

const formatSteps = (steps: string[]) =>
  steps.map((step, index) => `${index + 1}. ${step}`).join('\n');

export function generateMarkdownReport(report: AuditReportInput): string {
  return `# Audit Report

## Screen
${report.screenName}

## Issue
${report.title}

## Marked Area
${report.markedArea.description}

## Timestamp
${report.timestamp}

## User Note
${report.userNote}

## Expected
${report.expectedBehavior}

## Actual
${report.actualBehavior}

## Severity
${report.severity}

## Steps to Reproduce
${formatSteps(report.stepsToReproduce)}

## Agent Input
${report.agentInstruction}
`;
}

export function createAuditReport(input: AuditReportInput): AuditReport {
  const id = `${slugify(input.screenName)}-${Date.now().toString(36)}`;
  const base = {
    ...input,
    id,
    status: 'open' as const,
  };

  return {
    ...base,
    markdown: generateMarkdownReport(base),
  };
}
