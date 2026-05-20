# Idea Card Splitter

## Selected Track

Track 3 - Deduplicate notes and split into idea cards

## Project Overview

Idea Card Splitter is a mobile application designed to transform messy brainstorming notes into structured and easy-to-understand idea cards. Users often collect thoughts from chats, bullet lists, voice note transcripts, or fast brainstorming sessions. However, these notes usually contain repeated points, unfinished sentences, and similar ideas written in different forms.

This application solves that problem by using AI-assisted processing to clean the text, detect duplicate ideas, merge similar concepts, and generate concise idea cards.

## Problem Statement

During brainstorming sessions, users generate many raw ideas quickly. These notes are often:

- repetitive
- unstructured
- difficult to review later
- hard to prioritize
- scattered across different sources

As a result, valuable ideas may be lost or ignored because they are not organized properly.

## Proposed Solution

The proposed mobile app allows users to paste raw notes into a text area. The system then analyzes the content and performs the following steps:

1. Detect repeated or duplicate ideas
2. Merge similar concepts into a single item
3. Convert each unique idea into a card format
4. Generate a short title and summary for each card
5. Present results in a clean mobile interface

## Target Users

- Students working on project ideas
- Startup teams
- Product managers
- Hackathon participants
- Anyone doing brainstorming sessions

## Input Sources

The application accepts raw text from multiple sources such as:

- WhatsApp exports
- Telegram chats
- Bullet lists
- Meeting notes
- Voice note transcripts
- Personal brainstorming notes

## Output

The final output consists of structured idea cards containing:

- Short title
- One-sentence description
- Cleaned and deduplicated content

## Example Scenario

### Input:

- food delivery for students
- cheap meals in campus
- campus courier system
- note sharing app
- note sharing platform

### Output:

**Idea 1:** Student Campus Food Delivery  
Affordable and fast meal delivery system for university students.

**Idea 2:** Note Sharing Platform  
A platform where students can upload and access lecture notes.

## Why This Track Was Selected

This track was selected because it is practical, useful, and achievable within a short development time. It demonstrates clear AI value while keeping the mobile prototype simple and user-friendly.

## Technologies Used

- Vite
- TypeScript / JavaScript
- Capacitor
- Android Studio
- Gemini API (Google AI Studio)
- HTML / CSS

## Future Improvements

- Save cards locally
- Export ideas as PDF
- Add priority scoring
- Voice input support
- Team collaboration mode
- Dark mode
