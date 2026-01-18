/**
 * Transformation Engine
 * Parses and executes variable transformation pipelines.
 * NO eval, NO arbitrary code execution - only whitelisted functions.
 */

type TransformValue = string | number | boolean | string[] | null | undefined;

interface TransformStep {
  functionName: string;
  args: string[];
}

interface TransformResult {
  success: boolean;
  value?: TransformValue;
  error?: string;
}

/**
 * Parse a pipeline expression into steps
 * Example: "message | split(\"DESC\") | select(1)"
 */
export function parsePipeline(expression: string): TransformStep[] {
  const steps: TransformStep[] = [];
  
  // Split by | but respect quoted strings
  const parts = expression.split('|').map(s => s.trim());
  
  for (const part of parts) {
    if (!part) continue;
    
    // Check if it has arguments: functionName(arg1, arg2)
    const match = part.match(/^(\w+)(?:\((.*)\))?$/);
    if (!match) {
      throw new Error(`Invalid transformation syntax: "${part}"`);
    }
    
    const functionName = match[1];
    const argsString = match[2] || '';
    
    // Parse arguments - simple CSV split respecting quotes
    const args: string[] = [];
    if (argsString) {
      let current = '';
      let inQuote = false;
      let escapeNext = false;
      
      for (let i = 0; i < argsString.length; i++) {
        const char = argsString[i];
        
        if (escapeNext) {
          current += char;
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' || char === "'") {
          inQuote = !inQuote;
          continue;
        }
        
        if (char === ',' && !inQuote) {
          args.push(current.trim());
          current = '';
          continue;
        }
        
        current += char;
      }
      
      if (current) {
        args.push(current.trim());
      }
    }
    
    steps.push({ functionName, args });
  }
  
  return steps;
}

/**
 * Execute a single transformation step
 */
function executeStep(
  value: TransformValue,
  step: TransformStep,
): TransformResult {
  const { functionName, args } = step;
  
  try {
    switch (functionName) {
      case 'split':
        return transformSplit(value, args);
      case 'select':
        return transformSelect(value, args);
      case 'first':
        return transformFirst(value);
      case 'last':
        return transformLast(value);
      case 'join':
        return transformJoin(value, args);
      case 'clean':
        return transformClean(value);
      case 'replace':
        return transformReplace(value, args);
      case 'extract':
        return transformExtract(value, args);
      case 'lowercase':
        return transformLowercase(value);
      case 'uppercase':
        return transformUppercase(value);
      case 'titlecase':
        return transformTitlecase(value);
      case 'length':
        return transformLength(value);
      case 'contains':
        return transformContains(value, args);
      case 'default':
        return transformDefault(value, args);
      default:
        return {
          success: false,
          error: `Unknown transformation function: "${functionName}"`,
        };
    }
  } catch (err) {
    return {
      success: false,
      error: `Error in ${functionName}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Execute a complete pipeline
 */
export function executePipeline(
  initialValue: TransformValue,
  expression: string,
): TransformResult {
  try {
    const steps = parsePipeline(expression);
    let currentValue = initialValue;
    
    for (const step of steps) {
      const result = executeStep(currentValue, step);
      if (!result.success) {
        return result;
      }
      currentValue = result.value;
    }
    
    return { success: true, value: currentValue };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

function transformSplit(value: TransformValue, args: string[]): TransformResult {
  if (args.length === 0) {
    return { success: false, error: 'split() requires a separator argument' };
  }
  
  const separator = args[0];
  
  if (Array.isArray(value)) {
    // Split each element
    const result: string[] = [];
    for (const item of value) {
      const str = String(item);
      result.push(...str.split(separator));
    }
    return { success: true, value: result };
  }
  
  if (typeof value === 'string') {
    return { success: true, value: value.split(separator) };
  }
  
  return { success: false, error: 'split() requires a string or array' };
}

function transformSelect(value: TransformValue, args: string[]): TransformResult {
  if (args.length === 0) {
    return { success: false, error: 'select() requires an index argument' };
  }
  
  const index = parseInt(args[0], 10);
  if (isNaN(index)) {
    return { success: false, error: 'select() index must be a number' };
  }
  
  if (!Array.isArray(value)) {
    return { success: false, error: 'select() requires an array' };
  }
  
  // User indexes start at 1
  const actualIndex = index - 1;
  
  if (actualIndex < 0 || actualIndex >= value.length) {
    return {
      success: false,
      error: `select(${index}) index out of bounds (array has ${value.length} elements)`,
    };
  }
  
  return { success: true, value: value[actualIndex] };
}

function transformFirst(value: TransformValue): TransformResult {
  if (!Array.isArray(value)) {
    return { success: false, error: 'first() requires an array' };
  }
  
  if (value.length === 0) {
    return { success: false, error: 'first() cannot be used on empty array' };
  }
  
  return { success: true, value: value[0] };
}

function transformLast(value: TransformValue): TransformResult {
  if (!Array.isArray(value)) {
    return { success: false, error: 'last() requires an array' };
  }
  
  if (value.length === 0) {
    return { success: false, error: 'last() cannot be used on empty array' };
  }
  
  return { success: true, value: value[value.length - 1] };
}

function transformJoin(value: TransformValue, args: string[]): TransformResult {
  if (!Array.isArray(value)) {
    return { success: false, error: 'join() requires an array' };
  }
  
  const separator = args[0] || '';
  return { success: true, value: value.join(separator) };
}

function transformClean(value: TransformValue): TransformResult {
  if (typeof value !== 'string') {
    return { success: false, error: 'clean() requires a string' };
  }
  
  // Trim and normalize whitespace
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return { success: true, value: cleaned };
}

function transformReplace(value: TransformValue, args: string[]): TransformResult {
  if (args.length < 2) {
    return {
      success: false,
      error: 'replace() requires two arguments: from and to',
    };
  }
  
  if (typeof value !== 'string') {
    return { success: false, error: 'replace() requires a string' };
  }
  
  const from = args[0];
  const to = args[1];
  
  // Use replaceAll to replace all occurrences
  const result = value.split(from).join(to);
  return { success: true, value: result };
}

function transformExtract(value: TransformValue, args: string[]): TransformResult {
  if (args.length === 0) {
    return { success: false, error: 'extract() requires a regex pattern' };
  }
  
  if (typeof value !== 'string') {
    return { success: false, error: 'extract() requires a string' };
  }
  
  const pattern = args[0];
  
  try {
    const regex = new RegExp(pattern);
    const match = value.match(regex);
    
    if (!match) {
      return { success: true, value: '' };
    }
    
    // Return first captured group or entire match
    return { success: true, value: match[1] || match[0] };
  } catch (err) {
    return {
      success: false,
      error: `extract() invalid regex: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function transformLowercase(value: TransformValue): TransformResult {
  if (typeof value !== 'string') {
    return { success: false, error: 'lowercase() requires a string' };
  }
  
  return { success: true, value: value.toLowerCase() };
}

function transformUppercase(value: TransformValue): TransformResult {
  if (typeof value !== 'string') {
    return { success: false, error: 'uppercase() requires a string' };
  }
  
  return { success: true, value: value.toUpperCase() };
}

function transformTitlecase(value: TransformValue): TransformResult {
  if (typeof value !== 'string') {
    return { success: false, error: 'titlecase() requires a string' };
  }
  
  const titlecased = value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return { success: true, value: titlecased };
}

function transformLength(value: TransformValue): TransformResult {
  if (typeof value === 'string' || Array.isArray(value)) {
    return { success: true, value: value.length };
  }
  
  return { success: false, error: 'length() requires a string or array' };
}

function transformContains(value: TransformValue, args: string[]): TransformResult {
  if (args.length === 0) {
    return { success: false, error: 'contains() requires a search value' };
  }
  
  const searchValue = args[0];
  
  if (typeof value === 'string') {
    return { success: true, value: value.includes(searchValue) };
  }
  
  if (Array.isArray(value)) {
    return { success: true, value: value.includes(searchValue) };
  }
  
  return { success: false, error: 'contains() requires a string or array' };
}

function transformDefault(value: TransformValue, args: string[]): TransformResult {
  if (args.length === 0) {
    return { success: false, error: 'default() requires a fallback value' };
  }
  
  const fallback = args[0];
  
  // Use fallback if value is null, undefined, empty string, or empty array
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return { success: true, value: fallback };
  }
  
  return { success: true, value };
}
