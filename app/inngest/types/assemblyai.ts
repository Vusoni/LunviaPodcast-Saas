// This file allow me to give type for TypeScript for Assembly AI Model

// Assembly AI model
export type AssemblyAIWord = {
  text: string; // The word text
  start: number; // Start time in milliseconds
  end: number; // End time in milliseconds
  confidence?: number; // Transcription confidence (0-1)
};

export type AssemblyAISegment = {
  id: number; // Segment identifier
  start: number; // Start time in milliseconds
  end: number; // End time in milliseconds
  text: string; // Segment text
  words?: AssemblyAIWord[]; // Word-level breakdown (optional)
};

export type FormattedSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
};

export type AssemblyAIChapter = {
  start: number; // Chapter start time in milliseconds
  end: number; // Chapter end time in milliseconds
  gist: string; // Brief summary (1-2 words)
  headline: string; // Chapter title
  summary: string; // Detailed chapter description
};

export type AssemblyAIUtterance = {
  start: number; // Utterance start time in milliseconds
  end: number; // Utterance end time in milliseconds
  confidence: number; // Speaker detection confidence (0-1)
  speaker: string; // Speaker label (A, B, C, etc.)
  text: string; // What the speaker said
};

export type TranscriptWithExtras = {
  text: string; // Full transcript as plain text
  segments: FormattedSegment[]; // Time-coded segments
  chapters: AssemblyAIChapter[]; // AI-detected chapters (used for better summaries)
  utterances: AssemblyAIUtterance[]; // Speaker-attributed text
  audio_duration?: number; // Total audio duration in milliseconds
};
