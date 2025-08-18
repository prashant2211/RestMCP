import generateChatGPTResponse from './postProcessing.js';
import identifyChannelAndParams from './identifyChannelAndParams.js';
import identifyToolAndParams from './mcpToolsIdentifier.js';
import server, { initializeTools } from './mcpServer.js';

// ✅ Initialize tool registry once at startup
initializeTools();

const mainHandler = async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    const token = req.headers['x-sf-token'];
    const isToolMode = true;//req.headers['x-custom-tool'];

    if (!userPrompt) {
      return res.status(400).json({
        code: 400,
        success: false,
        error: "❌ 'prompt' is required in the request body."
      });
    }

    let toolOutput;

    if (isToolMode) {
      // 🔧 Custom tool mode — user defines the tool
       const { channelName, params } = await identifyChannelAndParams(userPrompt);
    //  const { toolName, params } = await identifyToolAndParams(userPrompt);
       // console.log('toolName -=-='+toolName);

        toolOutput = await server.invokeTool("genericSalesforceCall", {
        channelName,
        params,
        token
      });
    //   if (!server.hasTool(toolName)) {
    //     return res.status(400).json({
    //       code: 400,
    //       success: false,
    //       answer: `❌ Tool "${toolName}" not found.`
    //     });
    //   }

    //   toolOutput = await server.invokeTool(toolName, params);

    } else {
      // 🤖 Generic tool mode — use channel mapping
      const { channelName, params } = await identifyChannelAndParams(userPrompt);

      if (!channelName || channelName === "unknown") {
        return res.status(200).json({
          code: 200,
          success: false,
          answer: "❌ Could not identify a matching channel."
        });
      }

      toolOutput = await server.invokeTool("genericSalesforceCall", {
        channelName,
        params,
        token
      });
    }

    // 🧠 Post-process the tool output
    const finalAnswer = await generateChatGPTResponse(userPrompt, toolOutput);

    return res.status(200).json({
      code: 200,
      success: true,
      answer: finalAnswer
    });

  } catch (err) {
    console.error("🔥 Server Error:", err);
    return res.status(500).json({
      code: 500,
      success: false,
      error: err.message || "Internal Server Error"
    });
  }
};

export { mainHandler };
