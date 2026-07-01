const fs = require('fs');

let content = fs.readFileSync('src/data/questions.ts', 'utf-8');
let match = content.match(/export const QUESTIONS: Question\[\] = (\[[\s\S]*\]);/);

if (match) {
    let questionsText = match[1];
    let questions;
    try {
        questions = eval("(" + questionsText + ")");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
    
    questions.forEach(q => {
        let genericWrongOptions = [
            "Using a centralized monolithic SQL database",
            "Hardcoding the logic directly in the frontend",
            "Relying entirely on manual human intervention",
            "Executing synchronous blocking operations on the main thread",
            "Storing sensitive data in plaintext format",
            "Using standard legacy REST APIs without rate limiting",
            "Ignoring the schema definition and validation",
            "Bypassing standard security protocols for speed",
            "Relying solely on client-side validation",
            "Using a basic switch-case statement without ML"
        ];
        
        let correctText = q.options[q.answer];
        
        // Strip "Correct application for " and similar prefixes
        correctText = correctText.replace(/^Correct application for /i, "Deploying scalable pipelines for ");
        correctText = correctText.replace(/^Correct secure implementation of /i, "By securely enforcing ");
        correctText = correctText.replace(/^Correct standard procedure for /i, "By utilizing robust methodologies for ");
        
        // Fallback cleanup if the word Correct is still there
        if (correctText.toLowerCase().includes("correct")) {
            correctText = "Optimized handling of " + q.topic + " operations";
        }
        
        let newOptions = [correctText];
        
        // Pick 3 random wrong options
        let wrongPool = [...genericWrongOptions].sort(() => 0.5 - Math.random());
        newOptions.push(wrongPool[0]);
        newOptions.push(wrongPool[1]);
        newOptions.push(wrongPool[2]);
        
        // Shuffle newOptions and record the index of correctText
        let shuffled = [...newOptions].sort(() => 0.5 - Math.random());
        q.options = shuffled;
        q.answer = shuffled.indexOf(correctText);
    });
    
    let newContent = `export interface Question {\n  id: number;\n  topic: string;\n  difficulty: 'Easy' | 'Medium' | 'Hard';\n  question: string;\n  options: string[];\n  answer: number;\n}\n\nexport const QUESTIONS: Question[] = ${JSON.stringify(questions, null, 2)};\n`;
    
    fs.writeFileSync('src/data/questions.ts', newContent);
    console.log("Successfully fixed questions!");
} else {
    console.log("Could not find QUESTIONS array.");
}
