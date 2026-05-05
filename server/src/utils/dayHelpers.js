import jwt from 'jsonwebtoken';

/**
 * Creates a signed JWT token for user authentication.
 * Token is valid for 7 days and includes the user's ID as the payload.
 * Throws if JWT_SECRET environment variable is not defined.
 *
 * @param {string|ObjectId} userId - The user's MongoDB ObjectId or string ID
 * @returns {string} A signed JWT token that can be sent to client for storage in localStorage
 * @throws {Error} If JWT_SECRET is not defined in environment variables
 *
 * @example
 * const token = createToken('507f1f77bcf86cd799439011');
 * // Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2ODkxNjI4MDAsImV4cCI6MTY4OTc2NzYwMH0.kR2...'
 */
export const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/**
 * Parses a day ID string into module, week, and day numbers.
 * Day IDs use the format "m{moduleNumber}-w{weekNumber}-d{dayNumber}" for URL/state serialization.
 *
 * @param {string} dayId - Formatted day ID string (e.g., "m2-w3-d5")
 * @returns {Object} Parsed day components
 * @returns {number} returnValue.moduleNumber - Module number (1-indexed)
 * @returns {number} returnValue.weekNumber - Week number within module (1-indexed)
 * @returns {number} returnValue.dayNumber - Day number within week (1-7, where 1=Monday, 7=Sunday)
 *
 * @example
 * const dayId = 'M2-w3-d5';
 * const { moduleNumber, weekNumber, dayNumber } = parseDayId(dayId);
 * // Returns: { moduleNumber: 2, weekNumber: 3, dayNumber: 5 }
 */
export const parseDayId = (dayId) => {
  const [m, w, d] = dayId.split('-');
  return {
    moduleNumber: parseInt(m.replace('m', '')),
    weekNumber: parseInt(w.replace('w', '')),
    dayNumber: parseInt(d.replace('d', ''))
  };
};

/**
 * Builds a day ID string from module, week, and day numbers.
 * Inverse of parseDayId(). Used to serialize day positions into URLs and session state.
 *
 * @param {number} m - Module number (1-indexed)
 * @param {number} w - Week number within module (1-indexed)
 * @param {number} d - Day number within week (1-7, where 1=Monday, 7=Sunday)
 * @returns {string} Formatted day ID string (e.g., "m2-w3-d5")
 *
 * @example
 * const dayId = buildDayId(2, 3, 5);
 * // Returns: 'm2-w3-d5'
 */
export const buildDayId = (m, w, d) => `m${m}-w${w}-d${d}`;

/**
 * Retrieves a day object from the roadmap by module, week, and day numbers.
 * Looks up the nested day object in the roadmap JSON structure with graceful fallback:
 * First tries .find() by weekNumber, then falls back to array index (weekNumber - 1) in case
 * the roadmap data doesn't have explicit weekNumber properties on week objects.
 *
 * @param {Object} roadmapJson - Full roadmap JSON from database (contains modules array)
 * @param {Array<Object>} roadmapJson.modules - Array of module objects
 * @param {number} moduleNumber - Module number to find (1-indexed)
 * @param {number} weekNumber - Week number within module (1-indexed)
 * @param {number} dayNumber - Day number within week (1-7, where 1=Monday, 7=Sunday)
 *
 * @returns {Object|null} Day object if found, null if module/week/day does not exist
 * @returns {number} returnValue.dayNumber - Day number (1-7)
 * @returns {string} returnValue.dayName - Day name ("Monday", "Tuesday", etc.)
 * @returns {string} returnValue.type - Day type ("learning", "revision", or "exam")
 * @returns {string} returnValue.title - Day title or outcome description
 * @returns {Array<string>} returnValue.topicsList - Topics for this day
 * @returns {Array<Object>} [returnValue.examQuestions] - MCQ questions if type === "exam"
 *
 * @example
 * const roadmap = { modules: [{ moduleNumber: 1, weeks: [{ weekNumber: 1, days: [{dayNumber: 1, dayName: "Monday", ...}] }] }] };
 * const day = getDayFromRoadmap(roadmap, 1, 1, 1);
 * // Returns: { dayNumber: 1, dayName: "Monday", type: "learning", title: "...", topicsList: [...], ...}
 *
 * @example
 * // Array index fallback (if weekNumber property is missing)
 * const day = getDayFromRoadmap(roadmap, 1, 1, 3);
 * // First tries: weeks.find(w => w.weekNumber === 1)
 * // If not found: weeks[0] (weekNumber - 1 = 0)
 * // Returns: day object or null if not found
 */
export const getDayFromRoadmap = (roadmapJson, moduleNumber, weekNumber, dayNumber) => {
  const mod = roadmapJson.modules.find(m => m.moduleNumber === moduleNumber);
  if (!mod) return null;
  let week = mod.weeks.find(w => w.weekNumber === weekNumber);
  if (!week && mod.weeks) week = mod.weeks[weekNumber - 1]; // Array index fallback
  if (!week) return null;
  return week.days.find(d => d.dayNumber === dayNumber) || null;
};


/**
 * Calculates the next learning position in a roadmap after completing the current day.
 * **CRITICAL: This is the SINGLE SOURCE OF TRUTH for day-to-day advancement in the entire system.**
 * All progress advancement logic must use this function. No other code should perform day arithmetic.
 *
 * The function implements four cases for advancement:
 * 1. **Mid-week (dayNumber 1-6)**: Advance to next day in same week/module
 * 2. **End of week (dayNumber 7 = Sunday)**: Advance to Monday of next week in same module
 * 3. **End of module (last week, day 7 done)**: Advance to Monday, Week 1 of next module
 * 4. **End of roadmap (last module, last week, day 7 done)**: Set roadmapComplete=true
 *
 * @param {number} moduleNumber - Current module number (1-indexed)
 * @param {number} weekNumber - Current week number within module (1-indexed)
 * @param {number} dayNumber - Current day number within week (1-7: 1=Monday, 7=Sunday)
 * @param {Object} roadmapJson - Full roadmap JSON object from database
 * @param {Array<Object>} roadmapJson.modules - Array of module objects
 * @param {number} roadmapJson.modules[].moduleNumber - Module number
 * @param {Array<Object>} roadmapJson.modules[].weeks - Array of week objects in module
 * @param {number} roadmapJson.modules[].weeks[].weekNumber - Week number within module
 *
 * @returns {Object} Next position object
 * @returns {number} returnValue.newModule - Next module number
 * @returns {number} returnValue.newWeek - Next week number
 * @returns {string} returnValue.newDay - Next day name ("Monday", "Tuesday", etc.)
 * @returns {boolean} returnValue.roadmapComplete - True if roadmap is fully completed
 *
 * @example
 * // Case 1: Mid-week (Tuesday → Wednesday)
 * const roadmap = { modules: [{ moduleNumber: 1, weeks: [{ weekNumber: 1, days: [...] }] }] };
 * const result = calculateNextPosition(1, 1, 2, roadmap);
 * // Returns: { newModule: 1, newWeek: 1, newDay: "Wednesday", roadmapComplete: false }
 *
 * @example
 * // Case 2: End of week (Sunday → next Monday)
 * const result = calculateNextPosition(1, 1, 7, roadmap);
 * // Returns: { newModule: 1, newWeek: 2, newDay: "Monday", roadmapComplete: false }
 *
 * @example
 * // Case 3: End of module (last week Sunday → next module week 1 Monday)
 * const result = calculateNextPosition(1, 4, 7, roadmap);
 * // Returns: { newModule: 2, newWeek: 1, newDay: "Monday", roadmapComplete: false }
 *
 * @example
 * // Case 4: End of roadmap (last module, last week, Sunday)
 * const result = calculateNextPosition(2, 3, 7, roadmap); // Assuming module 2 is last, week 3 is last
 * // Returns: { newModule: 2, newWeek: 3, newDay: "Monday", roadmapComplete: true }
 *
 * @note This function MUST be the only place where day arithmetic happens in the codebase.
 * All callers: advanceProgress(), submitExam(on pass), SessionPage, ProgressPage must use this.
 * Duplicating this logic elsewhere will cause sync bugs and inconsistent state.
 */
export const calculateNextPosition = (moduleNumber, weekNumber, dayNumber, roadmapJson) => {
  const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  // dayNumber is 1-indexed. DAY_NAMES is 0-indexed.
  // Current day name: DAY_NAMES[dayNumber - 1]
  // Next day name: DAY_NAMES[dayNumber] (which is dayNumber+1 but 0-indexed)

  // Case 1: Not Sunday yet — advance to next day in same week
  if (dayNumber < 7) {
    return {
      newModule: moduleNumber,
      newWeek: weekNumber,
      newDay: DAY_NAMES[dayNumber], // dayNumber is 1-6, so dayNumber index = next day
      roadmapComplete: false
    };
  }

  // Case 2: Sunday done — try next week in current module
  const currentMod = roadmapJson.modules.find(m => m.moduleNumber === moduleNumber);
  if (!currentMod) {
    console.error(`calculateNextPosition: module ${moduleNumber} not found in roadmap`);
    return { newModule: moduleNumber, newWeek: weekNumber, newDay: 'Monday', roadmapComplete: false };
  }

  const nextWeek = currentMod.weeks.find(w => w.weekNumber === weekNumber + 1);
  if (nextWeek) {
    return {
      newModule: moduleNumber,
      newWeek: weekNumber + 1,
      newDay: 'Monday',
      roadmapComplete: false
    };
  }

  // Case 3: Last week of module done — try next module
  const nextModule = roadmapJson.modules.find(m => m.moduleNumber === moduleNumber + 1);
  if (nextModule) {
    return {
      newModule: moduleNumber + 1,
      newWeek: 1,
      newDay: 'Monday',
      roadmapComplete: false
    };
  }

  // Case 4: Last module, last week, Sunday done — roadmap complete
  return {
    newModule: moduleNumber,
    newWeek: weekNumber,
    newDay: 'Monday', // Doesn't matter — frontend checks roadmapComplete flag
    roadmapComplete: true
  };
};