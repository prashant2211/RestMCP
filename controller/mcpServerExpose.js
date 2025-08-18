import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import server, { initializeTools } from './mcpServer.js';
import generateChatGPTResponse from './postProcessing.js';

//initializeTools();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, 'mcpUserToken_Tools.json');


const mcpServerHandler = async (req, res) => {

// console.log(`Expose -==-=- ${JSON.stringify(req.body)}`)
// console.log(`tols -=-=- ${req.body.tool_choice.name}`);
// console.log(`input -=-=-${JSON.stringify(req.body.input)}`)
// console.log(`tool_call_id -=-=- ${req.body.tool_call_id}`);
// console.log(`tool_response_format -=-= ${req.body.tool_response_format}`);

 let param = req.body.input;
        console.log(`param -=-=- ${JSON.stringify(param)}`)

  const fileContent = await readFile(jsonPath, 'utf-8');
        let serverInfo = JSON.parse(fileContent);        
        let tokenfound = false;
        serverInfo.forEach((info, i) => {
        if(info.server_token === req.body.tool_call_id){
            console.log(`inside token match -=-=`);
          tokenfound = true
        }
        });

        if(!tokenfound){
              return res.status(401).json({
          success: false,
          error: `Incorrect Token`
        });
        }
       
        let token = 'abc';
       // param = 'Banglore'
        let toolOutput = await server.invokeTool(req.body.tool_choice.name, {
               param,
               token
              });
    //    console.log(`toolOutput -=-=-= ${JSON.stringify(toolOutput)}`)
        let userPrompt = ' give me the temperature and weather condition';
const finalAnswer = await generateChatGPTResponse(userPrompt, toolOutput);
    return res.status(200).json({
      code: 200,
      success: true,
      tool_response: finalAnswer
    });


}

export { mcpServerHandler };