const fs = require('fs');
const util = require('util');
const path = require('path');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const srcDirectory = 'src';
const englishTranslationFiles = 'lang/en.json';
const jsxTsxFileExtensions = ['.jsx', '.tsx'];
const searchPattern = /t_i18n\('[^']+'\)/g;
const extractedValues = {};

function extractValueFromPattern(pattern) {
  const match = /t_i18n\('([^']+)'\)/.exec(pattern);
  return match ? match[1] : null;
}

async function extractI18nValues(directory) {
  try {
    const files = await readdir(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        await extractI18nValues(filePath); // Recursively call the function for directories
      } else if (stats.isFile() && jsxTsxFileExtensions.includes(path.extname(filePath))) {
        const data = await readFile(filePath, 'utf8');
        const matches = data.match(searchPattern);
        
        console.log(filePath);
        console.log(matches);
        
        if (matches) {
          matches.forEach(match => {
            const value = extractValueFromPattern(match);
            if (value) {
              extractedValues[value] = value;
            }
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function mergeWithExistingData() {
  try {
    const existingData = await readFile(englishTranslationFiles, 'utf8');
    const existingValues = JSON.parse(existingData);
    
    const updatedValues = { ...existingValues };
    
    // Append only the new values that do not already exist in the file
    for (const key in extractedValues) {
      if (!updatedValues.hasOwnProperty(key)) {
        updatedValues[key] = extractedValues[key];
      }
    }
    // Write the merged values back to the file
    await writeFile(englishTranslationFiles, JSON.stringify(updatedValues, null, 2));
    console.log('File written successfully');
  } catch (error) {
    console.error(`Error merging with existing data: ${error.message}`);
  }
}

async function main() {
  await extractI18nValues(srcDirectory);
  await mergeWithExistingData();
}

main();
