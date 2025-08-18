import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, 'channelConfig.json');


const updateChannelHandler = async (req, res) => {
  try {
    let { ChannelName, Description } = req.body;
   // ChannelName = `${req.body.Type}/${ChannelName}`;
    if (!ChannelName || !Description) {
      return res.status(400).json({
        success: false,
        message: "Both 'ChannelName' and 'Description' are required."
      });
    }

    const fileContent = await readFile(jsonPath, 'utf-8');
    const channelInfo = JSON.parse(fileContent);

    channelInfo[`${req.body.Type}/${ChannelName}`] = Description;
    await writeFile(jsonPath, JSON.stringify(channelInfo, null, 2), 'utf-8');

    return res.status(200).json({
      success: true,
      message: `✅ ${ChannelName} channel has been successfully registered as an MCP Tool. Now you're all set to unlock its full potential!`
    });
  } catch (err) {
    console.error('❌ Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// export default updateChannelHandler;
export { updateChannelHandler };
