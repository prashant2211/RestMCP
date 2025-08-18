import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, 'mcpUserToken_Tools.json');


const registrationHandler = async (req, res) => {

    try {
      //  let { ChannelName, Description } = req.body;
       // ChannelName = `${req.body.Type}/${ChannelName}`;
        // if (!ChannelName || !Description) {
        //   return res.status(400).json({
        //     success: false,
        //     message: "Both 'ChannelName' and 'Description' are required."
        //   });
        // }
        const token = uuidv4();
    
        let userRequest = {
            "tools":req.body.tools,
            "server_Name":req.body.server,
            "formate":req.body.tool_response_format,
            "server_token": token
        }
        const fileContent = await readFile(jsonPath, 'utf-8');
        let serverInfo = JSON.parse(fileContent);
            serverInfo.push(userRequest);
        
       // channelInfo[`${req.body.Type}/${ChannelName}`] = Description;
        await writeFile(jsonPath, JSON.stringify(serverInfo, null, 2), 'utf-8');
    
        return res.status(200).json({
          success: true,
          token: token,
          message: `✅ ${req.body.server}  has been successfully registered as an MCP. Registered tools are [ ${req.body.tools} ]. Now you're all set to unlock its full potential!`
        });
      } catch (err) {
        console.error('❌ Error:', err);
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }


}

export { registrationHandler };