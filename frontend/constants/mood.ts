export const moodEmojis = ['😡', '😞', '😐', '🙂', '😃'];
export const moodColors = ['#ff4444', '#ff8800', '#4488ff', '#88ff88', '#1b5e20'];

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const getMoodEmoji = (level: MoodLevel): string => moodEmojis[level - 1];
export const getMoodColor = (level: MoodLevel): string => moodColors[level - 1];

